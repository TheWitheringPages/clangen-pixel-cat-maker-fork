/*
  Turns a `<select multiple>` into a checkbox list.

  The native control technically already supports picking several white
  patches (or scars, or accessories), but only if you know to ctrl-click,
  and that shortcut doesn't exist at all on a phone. So the select stays in
  the DOM as the source of truth and everything else in the app keeps
  reading `selectedOptions` from it, while this builds a visible list of
  checkboxes on top with a search box and a row of chips for what's on.
*/

type Row = {
  option: HTMLOptionElement;
  element: HTMLElement;
  checkbox: HTMLInputElement;
};

type Group = {
  element: HTMLElement;
  rows: Row[];
};

const pickers: { refresh: () => void }[] = [];

/** Re-reads every picker's select, which is where compatibility
 * filtering, randomize and cat loading all leave their changes. */
export function refreshMultiPickers() {
  for (const picker of pickers) {
    picker.refresh();
  }
}

function prettifyGroupLabel(label: string): string {
  return label.replace(/_/g, " ");
}

export function createMultiPicker(select: HTMLSelectElement, name: string) {
  const parent = select.parentElement;
  if (!parent) {
    return;
  }

  // the form row is a grid, so the picker takes the select's cell and the
  // select moves inside it rather than becoming a second child
  const container = document.createElement("div");
  container.className = "multi-picker";
  parent.insertBefore(container, select);
  container.appendChild(select);
  select.classList.add("multi-picker-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const bar = document.createElement("div");
  bar.className = "multi-picker-bar";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "multi-picker-search";
  search.placeholder = `Search ${name.toLowerCase()}`;
  search.setAttribute("aria-label", `Search ${name.toLowerCase()}`);

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "multi-picker-clear";
  clearButton.textContent = "Clear";
  clearButton.title = `Unpick every ${name.toLowerCase()}`;

  bar.append(search, clearButton);

  const chips = document.createElement("div");
  chips.className = "multi-picker-chips";

  const list = document.createElement("div");
  list.className = "multi-picker-list";
  list.setAttribute("role", "group");
  list.setAttribute("aria-label", name);

  const noMatches = document.createElement("p");
  noMatches.className = "multi-picker-no-matches hidden";
  noMatches.textContent = "Nothing matches that search.";

  container.append(bar, chips, list, noMatches);

  const rows: Row[] = [];
  const groups: Group[] = [];

  function notifyChange() {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addRow(option: HTMLOptionElement, into: HTMLElement): Row | null {
    // the blank option is the select's way of saying "none of these", and
    // the Clear button covers that better than an empty checkbox would
    if (option.value === "") {
      return null;
    }
    const label = document.createElement("label");
    label.className = "multi-picker-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = option.selected;

    const text = document.createElement("span");
    text.textContent = option.textContent ?? option.value;

    label.append(checkbox, text);
    into.appendChild(label);

    checkbox.addEventListener("change", () => {
      option.selected = checkbox.checked;
      notifyChange();
    });

    const row = { option, element: label, checkbox };
    rows.push(row);
    return row;
  }

  for (const child of Array.from(select.children)) {
    if (child instanceof HTMLOptGroupElement) {
      const group = document.createElement("div");
      group.className = "multi-picker-group";

      const heading = document.createElement("div");
      heading.className = "multi-picker-group-label";
      heading.textContent = prettifyGroupLabel(child.label);
      group.appendChild(heading);

      const groupRows: Row[] = [];
      for (const option of Array.from(child.children)) {
        if (option instanceof HTMLOptionElement) {
          const row = addRow(option, group);
          if (row) {
            groupRows.push(row);
          }
        }
      }
      list.appendChild(group);
      groups.push({ element: group, rows: groupRows });
    } else if (child instanceof HTMLOptionElement) {
      addRow(child, list);
    }
  }

  function buildChips() {
    chips.textContent = "";
    const selected = Array.from(select.selectedOptions).filter(
      (option) => option.value !== "",
    );
    if (selected.length === 0) {
      const empty = document.createElement("span");
      empty.className = "multi-picker-empty";
      empty.textContent = `No ${name.toLowerCase()} picked. Tick as many as you like.`;
      chips.appendChild(empty);
      return;
    }
    for (const option of selected) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "multi-picker-chip";
      chip.title = `Remove ${option.value}`;
      chip.append(
        document.createTextNode(option.textContent ?? option.value),
        Object.assign(document.createElement("span"), {
          className: "multi-picker-chip-x",
          textContent: "✕",
        }),
      );
      chip.addEventListener("click", () => {
        option.selected = false;
        notifyChange();
      });
      chips.appendChild(chip);
    }
  }

  function applySearch() {
    const query = search.value.trim().toLowerCase();
    let anyVisible = false;
    for (const row of rows) {
      // options the current pose has no art for are hidden by the
      // compatibility pass, and they should stay out of the list too
      const visible =
        !row.option.hidden &&
        (query === "" || row.option.value.toLowerCase().includes(query));
      row.element.classList.toggle("hidden", !visible);
      row.checkbox.disabled = row.option.disabled;
      if (visible) {
        anyVisible = true;
      }
    }
    for (const group of groups) {
      const empty = group.rows.every((row) =>
        row.element.classList.contains("hidden"),
      );
      group.element.classList.toggle("hidden", empty);
    }
    noMatches.classList.toggle("hidden", anyVisible);
  }

  function refresh() {
    for (const row of rows) {
      row.checkbox.checked = row.option.selected;
    }
    applySearch();
    buildChips();
  }

  search.addEventListener("input", applySearch);

  clearButton.addEventListener("click", () => {
    for (const option of Array.from(select.options)) {
      option.selected = false;
    }
    notifyChange();
  });

  refresh();
  pickers.push({ refresh });
}
