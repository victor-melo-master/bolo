# `test/` — Tests

Pruebas unitarias y end-to-end para el API BOLO.

## Tests unitarios

- Escritos con **Jest**
- Archivos `*.spec.ts` ubicados junto al código fuente que prueban
- Cubren servicios, casos de uso y controladores

## Tests e2e

- Configuración en `test/jest-e2e.json`
- Archivo principal: `test/app.e2e-spec.ts`
- Prueban flujos completos a través de los controladores HTTP

## Ejecución

```bash
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Con cobertura
```
