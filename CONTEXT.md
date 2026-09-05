# Pixel Cat Maker

Browser dollmaker for ClanGen MegaMerge sprites. Users build a cat appearance, save a local gallery, and share designs by URL.

## Language

**Cat Maker**:
The main dollmaker page where a single cat sprite is customized.
_Avoid_: Dollmaker app, editor (when meaning this page)

**Body**:
The tab for pose, coat, tortie layers, skin, and outline.
_Avoid_: Pelt tab, Base

**Face**:
The tab for eye colours only.
_Avoid_: Expression

**Markings**:
The tab for white patches, points, white tint, and vitiligo.
_Avoid_: Patterns (when meaning this tab)

**Additional**:
The tab for accessories and scars layered on top of the cat.
_Avoid_: Gear, Extras

**Studio**:
The tab for colour adjust, pixel paint, saved cats, and appearance data.
_Avoid_: Tools, Advanced

**Guided**:
Mobile mode that walks through the five tabs one step at a time with Next and Back.
_Avoid_: Wizard dropdown, skip menu

**Full view**:
Mobile mode that shows the same multi-tab layout as desktop.
_Avoid_: Desktop mode (on phone)

**Draft**:
A single overwrite slot in local storage for the in-progress mobile design.
_Avoid_: Autosave gallery entry

**Recents**:
Short history of recent designs with anti-spam identity rules.
_Avoid_: Gallery, Saved cats

**Gallery**:
Named cats the user explicitly saves in this browser.
_Avoid_: Recents, Draft

## Relationships

- The **Cat Maker** owns **Body**, **Face**, **Markings**, **Additional**, and **Studio**
- **Guided** and **Full view** are mutually exclusive mobile shells over the same tabs
- A **Draft** is not a **Gallery** entry
- **Recents** is separate from the **Gallery**

## Example dialogue

> **Dev:** "When the user changes the pelt on mobile, do we add a **Gallery** cat?"
> **Domain expert:** "No. Update the URL and the **Draft**. Only **Recents** forks on identity. The **Gallery** waits for Save."

## Flagged ambiguities

- "save" meant URL/draft persistence and gallery add at different times — resolved: URL + **Draft** + **Recents**; **Gallery** is explicit only.
- "Patterns" was proposed as a tab but overlapped pelt, tortie, and white — resolved: no Patterns tab; use **Body** and **Markings**.
