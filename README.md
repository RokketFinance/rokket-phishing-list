# rokket-phishing-list

Lista anti-phishing que consume **Rokket Wallet** para el chequeo de seguridad al conectar/firmar
con dApps. Es un **fork sincronizado** de
[`MetaMask/eth-phishing-detect`](https://github.com/MetaMask/eth-phishing-detect) más un overlay
propio con dominios scam de PulseChain y una whitelist de dApps de confianza.

## Cómo funciona

- `overlay.json` — adiciones propias: `blacklist` (dominios scam de PulseChain) y `whitelist`
  (dApps legítimas que nunca deben marcarse).
- `scripts/merge.mjs` — baja el `config.json` de MetaMask en vivo y genera:
  ```
  dist/config.json.blacklist = unión(MetaMask.blacklist, overlay.blacklist) − overlay.whitelist
  ```
  Se resta la whitelist porque la wallet consume **solo** la blacklist (sin lógica de whitelist),
  así garantizamos que los dApps de confianza nunca queden marcados.
- `.github/workflows/sync.yml` — corre el merge a diario (06:00 UTC) y commitea `dist/config.json`
  si cambió. Evita que el fork quede desactualizado.

## Consumo (URL pública)

```
https://cdn.jsdelivr.net/gh/RokketFinance/rokket-phishing-list@main/dist/config.json
```
Fallback: `https://raw.githubusercontent.com/RokketFinance/rokket-phishing-list/main/dist/config.json`

## Agregar dominios

Editar **solo** `overlay.json` y hacer push. El workflow regenera `dist/config.json` automáticamente.
No editar `dist/config.json` a mano (lo sobrescribe el bot).

## Formato

Compatible con `eth-phishing-detect` (`{ version, tolerance, fuzzylist, whitelist, blacklist }`).
