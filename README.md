# Pixel Cat Maker (fork)

A browser-based dollmaker that uses sprites from **ClanGen MegaMerge**. Build a cat,
predict its offspring, and lay out family trees - no download required.



This is a fork maintained by **Loathe** ([TheWitheringPages](https://github.com/TheWitheringPages/clangen-pixel-cat-maker-fork)),
forked from [CrazythecatDraws' ClanGen MegaMerge Pixel Cat Maker](https://github.com/CrazyDrawsProjects/clangen-megamerge-pixel-cat-maker),
which is itself based on the original [pixel-cat-maker](https://github.com/cgen-tools/pixel-cat-maker) by cgen-tools.
Because it targets MegaMerge, it includes the expanded MegaMerge/Lifegen sprite sets in
addition to vanilla ClanGen content. The sprite roster is currently up to date with
**v08.06.25 of Mega Merge**.

## Features

The site is split across a few pages, linked from the new header nav:

* **Cat Maker** (`index.html`) — the main dollmaker. Pick sprite/life stage, pelt (vanilla,
  Ster, Silly, Dance, Mimi, Lifegen-merge, Sparkle, and more), colour, tortie layers,
  tints, one or two eye colours, skin, white patches, accessories, and scars. Extras include:
  * Randomize (all or per-field)
  * Shading, reverse, and adjustable scale/background colour
  * Compare-with overlay against another sprite
  * Download PNG (with optional transparent background), an **age strip** (one image at every
    life stage), and a shareable **character card** with name and palette
  * Show/copy the sprite's colour palette
  * Copy a shareable cat URL that encodes the full design
  * A saved gallery, plus JSON import/export of appearance data
* **Predict Offspring** (`predict-offspring.html`) — takes two parent cats (by URL or from the
  gallery) and generates possible offspring using ClanGen's inheritance logic.
* **Family Tree** (`family-tree.html`) — add cats, assign parents, and grow a family tree.
  Trees are stored in the browser and can be exported to share or move elsewhere.
* **Scene Composer** (`scene.html`): arrange saved cats, stickers and a background on a
  larger canvas (drag, resize, rotate, flip, layer order, duplicate), then export the scene
  as a PNG. Upload your own backgrounds and stickers or draw a sticker pixel by pixel; all
  custom art stays in your browser. Backgrounds and stickers can optionally be submitted for
  everyone to use (see [Contributing art](#contributing-art)).

> [!NOTE]
> I originally used Git LFS for this project, but I eventually decided against using it. However, you can't remove LFS storage objects from a repository on GitHub without recreating the repository. So I recreated the repository.

## Contributing art

The Scene Composer can use community-made **backgrounds** and **stickers**. To submit one,
open an [art submission issue](https://github.com/TheWitheringPages/clangen-pixel-cat-maker-fork/issues/new?template=asset-submission.yml)
and attach your PNG. By submitting you confirm you made the art yourself and license it under
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). Submissions are reviewed by
hand, so nothing is added automatically.

Only backgrounds and stickers can be submitted. Custom pelts are not supported, because a pelt
is composited from spritesheets across every colour and pose rather than a single image.

To add an approved submission (maintainer):

1. Drop the PNG into `public/community/backgrounds/` or `public/community/stickers/`.
2. Add an entry to `src/assets/communityAssets.json` with `file`, `type` (`background` or
   `sticker`), `name`, and optional `author`/`credit`/`license`.
3. Rebuild and deploy. The asset then appears in the composer for everyone.

## Dev Requirements

- Node.js

## Dev Instructions

### Running and Building from Source

```
git clone https://github.com/TheWitheringPages/clangen-pixel-cat-maker-fork.git
cd clangen-pixel-cat-maker-fork
npm install
```

Split the sprites (only have to do this if the sprites change):
```
node scripts/build-sprites.js
```

To run the dev server:

```
npm run dev
```

To build:

```
npm run build
```

The site will be in the `dist` folder. Note that the built site won't run locally without a development server due to browser security policies. However, you should be able to upload it to [neocities](https://neocities.org) or any other static hosting site without a problem.

### Notes For Forks
* If using GitHub Actions to build and deploy the site, you have to go into `Settings > Pages` and make sure that `Source` under `Build and deployment` is set to `GitHub Actions`. Otherwise, GitHub will deploy the unprocessed HTML files, which won’t work. 

### Updating JSON Files

Unlike with ClanGen, even if you're just modifying the JSON files, you have to build from source. You _cannot_ (easily) modify the JSON files from the built site because the JSON data is transformed into Javascript objects during the build process for optimization.

JSON files only affect the _sprite renderer_ (i.e. the code that draws the sprite to the screen). They do not affect the options available on the website. To change the website, you must modify `index.json` and/or `src/main.ts`.

#### spritesIndex.json:

This file maps sprite group names to their spritesheet file and pixel offset. This allows you to use ClanGen-compatible spritesheets without modification, but it requires some preprocessing if you're adding any new sprites.

Currently, the simplest way to update this file is to modify ClanGen's `make_group()` function in `sprites.py`, then run the game normally (I'm sorry). Here's a quick example:

```py
#scripts/cat/sprites.py

def make_group(...):
  group_x_ofs = pos[0] * sprites_x * self.size
  group_y_ofs = pos[1] * sprites_y * self.size

  if not no_index:
      # You should set self.group_info = {} in the constructor
      self.group_info[name] = {
          "spritesheet": spritesheet,
          "xOffset": group_x_ofs,
          "yOffset": group_y_ofs
      }

# Later, write self.group_info to a JSON file
# This file will be spritesIndex.json
```

The April Fools' lineart is added to the JSON manually because it's not loaded regularly unless it's April Fools':
```json
  "aprilfoolslineart": {
    "spritesheet": "aprilfoolslineart",
    "xOffset": 0.0,
    "yOffset": 0.0
  },
  "aprilfoolslineartdead": {
    "spritesheet": "aprilfoolslineartdead",
    "xOffset": 0.0,
    "yOffset": 0.0
  },
  "aprilfoolslineartdf": {
    "spritesheet": "aprilfoolslineartdf",
    "xOffset": 0.0,
    "yOffset": 0.0
  }
```

#### white_patches_tint.json and tint.json

These are the same as the files that can be found in ClanGen under `sprites/dicts`. They're necessary because they define the exact tint colours and blending modes.

You should only replace these files if you added or changed any tints.

#### spritesOffsetMap.json

This file is used to map sprite numbers to their x and y offset in the sprite group.

You probably do not have to touch this.

#### peltInfo.json

This represents various data that's necessary to retrieve the correct sprite group.

Mostly, it specifies accessory types and scar type. If you added any new scars and accessories, you have to put them here as well. Otherwise, the site won't be able to find them.

## License

This Source Code Form is subject to the terms of the Mozilla Public
License, v. 2.0. If a copy of the MPL was not distributed with this
file, You can obtain one at https://mozilla.org/MPL/2.0/.

## Credits

* Sprites (all images in the `public/sprites` folder) are by the **ClanGen Team** and are
  licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). The
  MegaMerge/Lifegen sprite sets are by their respective mod teams.
* **Do not use sprites created by this generator for commercial purposes.**
* Some code (particularly the sprite drawing code in `src/drawCat.ts` and all its imports) is based on or derived from [ClanGen](https://github.com/ClanGenOfficial/clangen) which is licensed under MPL-2.0.
* Based on the original [pixel-cat-maker](https://github.com/cgen-tools/pixel-cat-maker) by
  cgen-tools, and forked from [CrazythecatDraws' ClanGen MegaMerge Pixel Cat Maker](https://github.com/CrazyDrawsProjects/clangen-megamerge-pixel-cat-maker).
</content>
</invoke>
