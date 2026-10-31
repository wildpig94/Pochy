# 💜 For Pocha — the archive

A private archive of one long-distance story. Five chapters
of a long-distance story between Mexico 🇲🇽 and Canada 🇨🇦, behind a password gate,
and one page at the end that is hers to write.

Published with GitHub Pages at `https://wildpig94.github.io/Pochy/`.
The page and every photograph are **encrypted**; the URL alone shows a password
box and nothing else. The password is not written anywhere in this repository
and is not reused for anything else.

## 🔓 No lock (for now)

The password gate is off: `index.html` is the page itself and the photographs in
`fotos/` are plain files. **Anyone with the link reads everything**, and a
photograph can be opened by its direct URL.

The tooling is still here if you want the lock back:

```
node tools/candado.mjs 'the-password'    # writes the lock + cifrado/, 15 MB
```

It encrypts the page and every photograph with AES-GCM (PBKDF2-SHA256, 300 000
rounds) and leaves `index.html` as a password box. The salt lives in
`tools/sal.txt` and the build is incremental, so turning it on again only
re-encrypts what changed.

## ✨ What's inside

- 🔒 **Password gate** — only she gets in.
- ⏱️ **Live numbers** — months together and the countdown to the door, both
  computed from the real date, so nothing here goes stale.
- 📖 **Five chapters** — opened one at a time from the contents list.
- ⭐ **Under the same sky** — animated starfield with shooting stars.
- 💍 **The ring** — the T.O.K.Y. promise, one letter at a time.
- 🙈 **Hidden texts** — words in the story, a moon and two sparkles open a photo
  and a note.
- 📸 **The plates** — 39 photographs in their own appendix chapter, with no
  captions at all, grouped by the part of the wait they belong to; full size on
  tap, arrows and Escape on a keyboard.
- ♫ **Two songs** with lyrics timed to the audio.
- 🎟️ **Five coupons** and a **print room** to make her own sheet.
- 🦎 **The axolotl** — a small mascot in the corner. It talks when tapped, and it
  knows what has been read and what is still waiting.
- ✍️ **Her page** — the last chapter is empty; what she writes is kept in her
  phone and can be sent back with one tap.
- 👏 **The fan** — a block in chapter III that says why, with its own six
  photographs (the `FAN` list in `tools/fotos.py`).
- 🤫 **10-minute secret** — a toast that only shows up if she stays that long.

## ⚠️ Two dates to confirm

They live at the top of the script in `index.html`, inside `CONFIG`:

```js
var CONFIG={
  togetherSince:'2026-05-27',   // el día en que empezó todo
  door:'2026-11-06'             // la fecha de la puerta
};
```

`door` comes from the old countdown ("November 6 — the next time I get to hold
you"); `togetherSince` is May 26, confirmed. Change either line and everything
that counts days fixes itself. Both work in the past too — after the date, the masthead says
*"open · N days"* instead of counting down.

## ♫ Music

Two songs, two sources:

1. If the file exists in `audio/`, it plays from there — no ads, no data, and the
   lyrics stay in sync because they are timed against the audio itself. Either
   extension works, the player tries `.m4a` first and then `.mp3`. What ships now
   is AAC 128 kbps with `faststart` (3.1 MB and 3.7 MB, from 8.8 and 10.6 MB),
   which starts playing without waiting for the whole file:
   ```
   audio/admv.m4a
   audio/perdonar-y-agradecer.m4a
   ```
2. If the file is missing, that song falls back to the YouTube player on its own.
3. `?source=yt` on the URL forces YouTube even when the files are there.

The lyrics are timed against the studio cuts. The files in `audio/` are the live
and study-session versions, so a song whose intro runs longer will start its
lyrics a little late or early — that is what `offset` is for, in seconds, per
song:

```js
{name:'ADMV',who:'Maluma',yt:'wo7PBOCie9w',file:'audio/admv',offset:0},
```

Positive numbers delay the lyrics. Check the first thirty seconds by ear; if the
highlight lands on the wrong line, nudge it. The YouTube player ignores `offset`.

## 📸 Photographs

Originals live in **`fotos/`**; `memoria1` … `memoria26` are the timeline,
`nueva01` … `nueva14` the newer ones, `cap4-1` … `cap4-8` the last chapter, and
`nuestra-primera-foto.jpg` the one in the ring reveal.

The page never loads those originals while reading. It loads the light versions in
**`fotos/web/`** (480 px and 900 px WebP) and only reaches for the original when a
photo is opened full size or printed. That is 10.8 MB → 1.9 MB.

### The photographs live in their own chapter

No photograph carries a caption anymore. The story is text; the photographs are
in **chapter VI — The plates**, grouped by the part of the wait they belong to
and in the order they arrived. A group label can be wrong, but a group label
does not sit on top of one photograph pretending to describe it, so there is no
`photo ↔ caption` pairing left to get wrong.

The only thing left to decide is which group each photograph is in, and that
lives in **one place**: `GRUPOS` in `tools/fotos.py`.

```python
('The wait', 'the part nobody photographs', [
    'memoria1.jpg',
    'memoria2.jpg',
    ...
]),
```

From that table, one command writes both things:

```
python3 tools/fotos.py
```

- rewrites the gallery inside `index.html`, between the `FOTOS:inicio` and
  `FOTOS:fin` markers, with srcset and `data-full` already built — and if
  nothing changed in the table the file comes out byte for byte identical;
- builds **`revisar.html`**, a local page with every photograph, its file name
  and a dropdown to move it to another group. It is gitignored and never
  published.

When you add a photograph: run `python3 tools/webp.py`, add its line to a group
in the table, and run `python3 tools/fotos.py`.

## 🦎 The axolotl

Lives at the bottom left, fixed, so it never covers text. It blinks, breathes, and
when tapped says something about what is still unread. It lifts a small heart when
a hidden text is found, and it hides when printing.

## ✍️ Her page

Chapter V. It autosaves to `localStorage` as she types (a small "kept" flashes
for two seconds and then goes), and **Send it to me** opens the share sheet (or
WhatsApp) with the text already written. Nothing leaves her phone until she
presses send.

## 🧠 What the page remembers

`localStorage`, key `pochy-archive-v1`: chapters opened, plates opened, hidden
texts found, her page, first and last visit. None of it is shown as a number —
there is no progress bar and no visit counter on purpose. What it feeds is the
returning-visitor line in the opening screen and the axolotl. Clearing browser
data resets all of it.

## 🚀 Edit and publish

There are two files, not one. `fuente/index.html` is the page you edit; it is
gitignored, along with `fotos/`. What gets published is generated:

```
python3 tools/fotos.py                 # photos -> fuente/index.html (the gallery)
node tools/candado.mjs 'the-password'  # fuente/ + fotos/ -> index.html + cifrado/
git add -A && git commit -m "..." && git push
```

`node tools/candado.mjs` re-encrypts everything with a fresh salt, so after
every change the whole site is re-keyed with the same password. GitHub Pages
rebuilds in a minute or two.

To read the page without the lock while working (no encryption, plaintext
photos), open `fuente/index.html` directly: when `window.__abrir` does not
exist, the page falls back to the plain URLs.

## 🗂️ Files

- `index.html` — **the lock**: the password box and the decryption. Generated;
  do not edit it by hand.
- `fuente/index.html` — the page itself, in the clear. This is the file to edit.
  Gitignored, never published.
- `cifrado/` — the encrypted page and the 117 encrypted photographs.
- `nueva.html` — an old copy (before the blue/purple/black version). Safe to delete.
- `original.html` — the very first version, kept for reference.
- `fotos/` — originals and light versions, in the clear. Gitignored, never
  published.
- `audio/` — put the two songs here.
- `tools/webp.py` — rebuilds `fotos/web/`.
- `tools/fotos.py` — the photograph/group table, and the script that writes the
  gallery into `index.html` and builds `revisar.html`.
- `tools/revisar.plantilla.html` — the shell of the review page.
- `tools/candado.mjs` — encrypts the page and the photographs and writes the lock.
- `tools/candado.plantilla.html` — the lock's own HTML.
- `robots.txt` — keeps search engines out.
