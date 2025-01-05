# Renderer Styling

## Compiling SCSS
This project uses [SCSS](https://sass-lang.com/) for styling. It's a more advanced version of `CSS` that allows for more complex styling. To compile [SCSS](https://sass-lang.com/) to `CSS`, run:
```bash
   yarn install # (If you haven't already) install dependencies
   yarn run sass # Compiles SCSS to CSS
```
This will add a *watcher* to the `main.scss` file in `html/style/`. As soon as anything changes in the `SCSS` file, it will compile into `CSS`.