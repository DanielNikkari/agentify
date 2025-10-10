# Agentify Backend

## Run Docker

**Compose dev**

```bash
docker compose -f docker-compose.dev.yaml up --build
```

**Compose Prod**

```bash
docker compose -f docker-compose.prod.yaml up --build
```

**When Done**

```bash
docker compose -f file-name down
```

`-f`: Tells the file that docker compose should use

`--build`: Forces a rebuild of the image before running
