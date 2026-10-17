# foka.kodena.se

Publik webbplats och nedladdningar för **Foka av Kodena**.
Appens källkod och byggflöde ligger i det separata privata Foka-repot.

Webbplatsen är vanlig HTML, CSS och JavaScript utan byggberoenden.
`site/index.html` är engelska, `site/sv.html` svenska och `site/privacy.html`
innehåller integritetsinformationen. Demon stöder flyttning och storleksändring.

GitHub Actions kontrollerar webbplatsen och publicerar endast `site/` via Pages.
Se [installationsguiden](docs/SETUP.md) för Pages, domän och releaseöverföring.
Support: [foka@kodena.se](mailto:foka@kodena.se).

## Kontrollera lokalt

```sh
node tests/demo-interactions.cjs
node tests/downloads.cjs
python3 tests/check_site.py
python3 -m http.server --directory site 8080
```

Nedladdningarna hämtas från detta repos senaste publika release. Om ingen release
finns visas ett meddelande om att nedladdningarna förbereds. API-fel lämnar kvar
vanliga länkar till Releases. Inga privata repo- eller ChatGPT-länkar används.

Paketen läggs som releasebilagor, aldrig i Git-historiken. Releasens automatiska
Source code-arkiv innehåller endast den publika webbplatsens källkod.
