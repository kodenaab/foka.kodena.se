# Aktivera hemsida och publika releaser

## GitHub Pages

1. Öppna detta repo → Settings → Pages.
2. Välj Source: **GitHub Actions**.
3. Kör `Publish Foka website` under Actions om det tidigare försöket misslyckades.
4. Prova först https://kodenaab.github.io/foka.kodena.se/.

## Egen domän

Verifiera först domänen i GitHub-kontots Settings → Pages med den TXT-post GitHub
visar. Lägg därefter till `foka.kodena.se` som Custom domain i detta repos Pages.
Hos DNS-leverantören lägger du till:

| Typ | Namn | Mål |
| --- | --- | --- |
| CNAME | foka | kodenaab.github.io |

Målet innehåller inget `https://` och ingen sökväg. Ersätt endast eventuella
befintliga poster för just `foka`; ändra inte företagets webb- eller e-postposter.
Aktivera Enforce HTTPS när GitHub har verifierat DNS och utfärdat certifikatet.
En CNAME-fil behövs inte för den här publiceringen med GitHub Actions.

## Token för releaseöverföring

Skapa en **fine-grained personal access token** i GitHub-kontots
Settings → Developer settings → Personal access tokens → Fine-grained tokens:

- Resource owner: **kodenaab**.
- Repository access: **Only select repositories → foka.kodena.se**.
- Repository permissions: **Contents: Read and write**. Metadata får standardläsning.
- Välj ett slutdatum som du kan bevaka och förnya före utgången.

Spara token direkt i det **privata Foka-repot** under Settings → Secrets and
variables → Actions → New repository secret, med namnet **PUBLIC_RELEASE_TOKEN**.
Lägg inte token i något av repona, i webbplatsen eller i en chatt.

Efter godkänd release i Foka-repot kan dess byggflöde publicera en motsvarande
release här. För befintliga releaser används det privata repots manuella workflow
`Publish public Foka release`, med exempelvis `0.2.31` som version.
Det kopierar de publicerade filerna och verifierar SHA256SUMS.txt; det bygger
inte om versionen. Publika releaser skrivs inte över.

Endast Mac-DMG, portabel Windows-ZIP, MSIX-test-ZIP och kontrollsummor överförs.
Store-underlag, certifikat och appens källkod publiceras inte. MSIX-testkitet är
för lokal provinstallation och ska inte skickas till Microsoft Store.

## Innan Store-inskickning

Granska integritetsinformationen och komplettera vid behov med juridiskt
företagsnamn samt era faktiska rutiner för supportärenden. När sidan är live på
egen domän kan `https://foka.kodena.se/privacy.html` användas som policyadress.
Kontrollera själv att supportadressen tar emot mejl. Ingen donationsbetalning
är ansluten till webbplatsen.
