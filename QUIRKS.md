# Externe Ressourcen

Die gilt es wegen GDPR dreck zu vermeiden:

## Google-fonts

`assets/scss/_variables_project.scss`:
```
$td-enable-google-fonts: false;
```

Problem: Nicht alle Fonts in dem Ding kommen von Google, da wird noch
ein font-face in `assets/scss/rtl/_main.scss` von woanders her geholt.
Da das nur irgendwelche arabischen Sprachen betrifft ueberschreiben wir
die Datei mir einer leeren Version:

```
touch assets/scss/rtl/main.scss
```

Jetzt sieht die Navi aber bloed aus mit den System-Fonts, also:
[Open Sans](https://gwfh.mranftl.com/fonts/open-sans?subsets=latin) runterladen:

```
$ find static/assets/open-sans
$ git grep -A 5 open.sans assets/
assets/scss/_variables_project.scss:@import url("/assets/open-sans/font-face.css");
assets/scss/_variables_project.scss-
assets/scss/_variables_project.scss-$font-family-sans-serif: "Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
assets/scss/_variables_project.scss-  "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
assets/scss/_variables_project.scss-  "Segoe UI Symbol";
assets/scss/_variables_project.scss-
```

## JQuery

Das ist fest verdrahtet in `layouts/partials/head.html`, also diese
Datei von https://github.com/google/docsy holen und entsprechend anpassen.
In diesem Fall wurde `.Site.params.jquery` als option aus `config.toml` definiert
und falls das gesetzt ist, wird diese URL genommen. Konkret:

```
$ grep -C 10 jquery layouts/partials/head.html
$ find static/assets/jquery
$ grep jquery config.toml
```