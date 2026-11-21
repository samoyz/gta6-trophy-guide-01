# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/samoyz/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/samoyz/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI.

## What it is

- **All 55 official trophies** with their official name, description and grade, each with a guide written in our own words and a cited source (Exophase, PSNProfiles, PowerPyx, Push Square).
- **A tracker**: tick trophies off and the progress saves in the browser (localStorage), with export to a file and import back.
- **Filters** by grade (platinum, gold, silver, bronze) and by kind (story, missable, collectibles, activities), plus search.
- **A spoiler setting** that hides the names and descriptions of the 25 story trophies until they are earned.
- **A 5-stage roadmap** to the platinum and a **missables list** flagging the 5 one-attempt or choice-locked trophies. Guides whose exact trigger is not yet confirmed by the community say so honestly.
- **Fully offline**: static files under `app/`, no build step, no network requests. Serve `app/` with any static server and open `app/index.html`.

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `output/dossier.json` with the vendored make.fun library.

## License

MIT. See [LICENSE](LICENSE).
