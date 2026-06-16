# TackSuite Chat — Plugin WordPress

Un plugin WordPress pronto all'uso che incorpora il widget di chat
[`@tacksuite/widget`](../) sul tuo sito. Sostituisce lo snippet manuale:

```html
<script src="https://unpkg.com/@tacksuite/widget" defer></script>
<tacksuite-chat workspace="il-tuo-slug-workspace"></tacksuite-chat>
```

…con una pagina di impostazioni nell'amministrazione (**Impostazioni → TackSuite Chat**)
che inserisce automaticamente lo script e l'elemento `<tacksuite-chat>` nel footer del sito.

## Cosa fa

- Carica lo script del widget (in modalità defer) **incluso nel plugin** (`assets/tacksuite-widget.umd.js`), senza dipendere da CDN esterne.
- Inserisce `<tacksuite-chat>` in `wp_footer` con gli attributi configurati.
- Espone `workspace`, `position`, `color` e `base-url` come impostazioni.
- Permette di attivare/disattivare il widget senza disattivare il plugin.

## Aggiornare il widget incluso

Lo script è una copia della build di [`@tacksuite/widget`](../). Per aggiornarlo:

```bash
# dalla root del repo
npm run build
cp dist/tacksuite-widget.umd.js wordpress-plugin/tacksuite-chat/assets/
```

Poi aggiorna la costante `TACKSUITE_CHAT_WIDGET_VERSION` in `tacksuite-chat.php`
con la nuova versione del widget (per il cache-busting).

## Installazione

### Opzione A — carica la cartella

Copia `tacksuite-chat/` in `wp-content/plugins/` e attivalo dalla schermata **Plugin**.

### Opzione B — installa uno ZIP

```bash
cd wordpress-plugin
zip -r tacksuite-chat.zip tacksuite-chat
```

Poi nell'amministrazione WP: **Plugin → Aggiungi nuovo → Carica plugin → tacksuite-chat.zip → Attiva**.

## Configurazione

1. Vai su **Impostazioni → TackSuite Chat**.
2. Inserisci lo slug del workspace (il valore `workspace` dal tuo codice di embed).
3. (Facoltativo) apri **Impostazioni avanzate** per personalizzare posizione, colore o URL di base.
4. Salva — il widget compare sul sito.

## Note

- Il widget recupera la propria configurazione pubblica dalla tua istanza TackSuite e
  non mostra nulla se il workspace è disattivato: quindi un footer vuoto di solito
  significa che il workspace è disattivato o che lo slug è errato.
- Per TackSuite self-hosted, imposta l'**URL di base** sulla tua istanza.
- Impostazioni, sanitizzazione ed escaping seguono la Settings API di WordPress.

## Test in locale con Docker

Un ambiente WordPress completo è incluso in `docker-compose.yml`. Il plugin è
montato in tempo reale, quindi le modifiche ai file in `tacksuite-chat/` sono
immediate.

```bash
cd wordpress-plugin
docker compose up -d
```

- Sito: http://localhost:8080
- Amministrazione: http://localhost:8080/wp-admin (`admin` / `admin`)

```bash
docker compose down      # ferma (mantiene i dati)
docker compose down -v   # reset completo (cancella WP + DB)
```
