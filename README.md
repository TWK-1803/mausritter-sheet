# mausritter-sheet
![Version](https://img.shields.io/badge/version-1.10.2-blue.svg?cacheSeconds=2592000)
[![License Mausritter Third Party Licence](https://img.shields.io/badge/License-Mausritter%20Third%20Party%20Licence-yellow.svg)](https://mausritter.com/third-party-licence/)

**Mausritter Character Sheet** is a web application for **Mausritter** mice character sheet. You can use it, freely, from https://mausritter-sheet.dco.ninja.

> Mausritter is about small-scale adventurers in a huge world. Mouse adventurers who take on big challenges and face down grave danger.

Have a look at [Mausritter website](https://mausritter.com/) and [Licence](./LICENSE.md).

## Features
- Play your mouse
- Create a random mouse (implement Mouse creation rules from Mausritter Rules book),
- Translated in English, Español, Deutsch and Français,
- Manage hirelings,
- Roll dices with/without advantage or disadvantage,
- Drag'n'drop items or conditions on inventory slots
- Drag'n'drop in grit.
- Drag'n'drop in bank, retrieving item from bank cost 1% of its price.
- History of dices and other actions.
- Save and load whole character sheet from local storage. 12 slots are available. All data is saved in your browser, no server is needed.
- Import / Export of character sheet. Use this to load a character into another browser.
- Mouse can rest and advance in level, up to level 20.

![Mausritter Sheet](/mausritter-sheet-00.jpg)

See [TODO.md](./src/TODO.md) for incoming features :-)

![Exemple Sheet 0.1.1](./live.gif)

## Companions
Another Mausritter application is [Mausritter-Colony](https://github.com/yar0d/mausritter-colony). It's a minimalist tool to help GM to manage their game table.

## Help wanted
Some help will be welcome to translate to other languages. Currently we have:

- English by myself
- French by myself
- Spanish by CoyoteBlur
- German by Keter150
- Russian by Sorinqi

## For Translators
The folder `/src/locales/` contains all messages files in a simple JSON format. To translate' you just have to copy a file by modifying its name with the language code you're targeting. By example, to translate to Spanish (Castilian), I copy `conditions.en-US.json` to `conditions.es-ES.json`, then `en-US.json` to `es-ES.json`, and so on.

A [ISO Language Code Table](http://www.lingoes.net/en/translator/langcode.htm) exits to help you find the correct language code.

Translations is easy. JSON files contains message formatted like that:
```json
  "original-message-in-english": "translation of the message in english"
```

You just have to translate the right part. Here is a short example, for French fr-FR:
```json
  "Languages": "Langues",
  "Welcome to Mausritter Sheet!": "Bienvenue sur la fiche de personnage Mausritter !",
```

Note that the language name is translated into it's own language.

### Exception for `mouse-names`
You just create a new `mouse-names.??-??.js` as described above. Translations is simple, you can replace every string by yours.

### How to put your translations in mausritter-sheet
When all messages are translated, you can open an issue on the github with the label **i18n** and a title like *I've translated to <language>* ;-). You can also contact me on discord at `Yar0d#3470`.

## For developers
This application is made with [Vue.js 3](https://vuejs.org/), [Vite](https://vite.dev/) and [wave-ui](https://antoniandre.github.io/wave-ui/).

It requires [Node.js](https://nodejs.org/) 22.13 or newer (see `.nvmrc`). Clone this repository and install dependencies with `npm install`.

The API URL of the Mausritter Colony server can be overridden with `VITE_API_URL` (e.g. in a `.env.local` file).

### Development cycle

1. Create a branch.
2. Do the developer work :)
3. Commit the stuff in branch.
4. When it's ready, publish the branch `git push --set-upstream origin BRANCH`.
5. Then create a public release the work with `npm run release:publish` from the branch.
6. Create a **merge request**, on *github* it's a *pull request* with `base: main` <- `compare: BRANCH`. Then **merge** it.
7. To deploy, get the main branch with `git checkout main ; git pull`
8. Build with `npm run build`.
9. Deploy the directory `dist`.

### Update packages
```
npm update
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Lints files
```
npm run lint
npm run lint:fix
```

### Compiles and minifies for production
```
npm run build
```

### FTP deploy
1. Publish a release with `npm run release:publish`
2. Build with `npm run build`. We now have a **dist** folder.
3. Send all content on the **dist** folder to your FTP server.

### Customize configuration
See [Vite Configuration Reference](https://vite.dev/config/).
