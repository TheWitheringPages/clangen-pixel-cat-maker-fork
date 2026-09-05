/*
  Turns a single-value `<select>` into a searchable list.

  The native select stays in the DOM as the source of truth (same pattern as
  multiPicker). Compatibility filtering, randomize, and cat loading keep
  writing to the select; refreshSearchablePickers() syncs the visible UI.
*/

type Row = {
  option: HTMLOptionElement;
  element: HTMLElement;
};

type Group = {
  element: HTMLElement;
  rows: Row[];
};

const pickers: { refresh: () => void }[] = [];

/** Re-reads every single-select picker after external select mutations. */
export function refreshSearchablePickers() {
  for (const picker of pickers) {
    picker.refresh();
  }
}

function prettifyGroupLabel(label: string): string {
  return label.replace(/_/g, " ");
}

export function createSearchablePicker(select: HTMLSelectElement, name: string) {
  if (select.multiple) {
    return;
  }
  if (select.closest(".searchable-picker") || select.closest(".multi-picker")) {
    return;
  }

  const parent = select.parentElement;
  if (!parent) {
    return;
  }

  const container = document.createElement("div");
  container.className = "searchable-picker";
  parent.insertBefore(container, select);
  container.appendChild(select);
  select.classList.add("searchable-picker-native");
  select.tabIndex = -1;
  select.setAttribute("aria-hidden", "true");

  const current = document.createElement("div");
  current.className = "searchable-picker-current";
  current.setAttribute("aria-live", "polite");

  const bar = document.createElement("div");
  bar.className = "searchable-picker-bar";

  const search = document.createElement("input");
  search.type = "search";
  search.className = "searchable-picker-search";
  search.placeholder = `Search ${name.toLowerCase()}`;
  search.setAttribute("aria-label", `Search ${name.toLowerCase()}`);

  bar.appendChild(search);

  const list = document.createElement("div");
  list.className = "searchable-picker-list";
  list.setAttribute("role", "listbox");
  list.setAttribute("aria-label", name);

  const noMatches = document.createElement("p");
  noMatches.className = "searchable-picker-no-matches hidden";
  noMatches.textContent = "Nothing matches that search.";

  container.append(current, bar, list, noMatches);

  const rows: Row[] = [];
  const groups: Group[] = [];

  function notifyChange() {
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function addRow(option: HTMLOptionElement, into: HTMLElement): Row {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "searchable-picker-option";
    button.setAttribute("role", "option");
    button.textContent =
      option.textContent?.trim() || option.value || "(none)";

    button.addEventListener("click", () => {
      if (select.disabled || option.disabled) {
        return;
      }
      select.value = option.value;
      // some blank options use empty value; ensure selection sticks
      option.selected = true;
      notifyChange();
      refresh();
    });

    into.appendChild(button);
    const row = { option, element: button };
    rows.push(row);
    return row;
  }

  for (const child of Array.from(select.children)) {
    if (child instanceof HTMLOptGroupElement) {
      const group = document.createElement("div");
      group.className = "searchable-picker-group";

      const heading = document.createElement("div");
      heading.className = "searchable-picker-group-label";
      heading.textContent = prettifyGroupLabel(child.label);
      group.appendChild(heading);

      const groupRows: Row[] = [];
      for (const option of Array.from(child.children)) {
        if (option instanceof HTMLOptionElement) {
          groupRows.push(addRow(option, group));
        }
      }
      list.appendChild(group);
      groups.push({ element: group, rows: groupRows });
    } else if (child instanceof HTMLOptionElement) {
      addRow(child, list);
    }
  }

  function applySearch() {
    const query = search.value.trim().toLowerCase();
    let anyVisible = false;
    for (const row of rows) {
      const label = (row.option.textContent ?? row.option.value).toLowerCase();
      const value = row.option.value.toLowerCase();
      const visible =
        !row.option.hidden &&
        (query === "" || label.includes(query) || value.includes(query));
      row.element.classList.toggle("hidden", !visible);
      row.element.toggleAttribute("disabled", row.option.disabled || select.disabled);
      if (row.option.selected) {
        row.element.classList.add("selected");
        row.element.setAttribute("aria-selected", "true");
      } else {
        row.element.classList.remove("selected");
        row.element.setAttribute("aria-selected", "false");
      }
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

  function syncCurrent() {
    const selected =
      select.selectedOptions[0] ??
      select.options[select.selectedIndex] ??
      null;
    const text =
      selected?.textContent?.trim() ||
      selected?.value ||
      "(none)";
    current.textContent = text;
    container.classList.toggle("is-disabled", select.disabled);
    search.disabled = select.disabled;
  }

  function refresh() {
    syncCurrent();
    applySearch();
  }

  search.addEventListener("input", applySearch);
  refresh();
  pickers.push({ refresh });
}

/** Attach searchable pickers to every single-value select in a root. */
export function initSearchablePickers(root: ParentNode = document) {
  const selects = root.querySelectorAll("select:not([multiple])");
  for (const select of Array.from(selects)) {
    if (!(select instanceof HTMLSelectElement)) {
      continue;
    }
    // skip preview chrome and tiny enums that are fine as native
    if (select.closest(".preview-chrome-native")) {
      continue;
    }
    if (select.classList.contains("saved-cats-select")) {
      continue;
    }
    const name =
      select.getAttribute("data-picker-name") ||
      select.getAttribute("aria-label") ||
      select.className
        .split(/\s+/)
        .find((c) => c.endsWith("-select") || c === "zoom-level")
        ?.replace(/-select$/, "")
        .replace(/-/g, " ") ||
      "options";
    createSearchablePicker(select, name);
  }
}
