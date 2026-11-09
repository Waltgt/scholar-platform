<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import Tag from "primevue/tag";

type Health = {
  status: "ok" | "degraded";
  db: "ok" | "unavailable";
};

type State =
  | { kind: "loading" }
  | { kind: "ok"; data: Health }
  | { kind: "error"; message: string };

const state = ref<State>({ kind: "loading" });

async function check(): Promise<void> {
  state.value = { kind: "loading" };
  try {
    const res = await fetch("/api/health", { headers: { Accept: "application/json" } });
    // 503 también trae JSON ({ status: "degraded" }), así que no se descarta por res.ok
    const data = (await res.json()) as Health;
    state.value = { kind: "ok", data };
  } catch {
    state.value = {
      kind: "error",
      message: "No hay respuesta de la API. Revisa que esté corriendo en el puerto 3000.",
    };
  }
}

onMounted(check);
</script>

<template>
  <main class="health">
    <h1>Estado del sistema</h1>

    <p v-if="state.kind === 'loading'">Comprobando…</p>
    <p v-else-if="state.kind === 'error'">{{ state.message }}</p>
    <dl v-else>
      <dt>API</dt>
      <dd>
        <Tag :severity="state.data.status === 'ok' ? 'success' : 'warn'" :value="state.data.status" />
      </dd>
      <dt>Base de datos</dt>
      <dd>
        <Tag :severity="state.data.db === 'ok' ? 'success' : 'danger'" :value="state.data.db" />
      </dd>
    </dl>

    <Button
      label="Comprobar de nuevo"
      icon="pi pi-refresh"
      :loading="state.kind === 'loading'"
      @click="check"
    />
  </main>
</template>

<style scoped>
.health {
  max-width: 32rem;
  margin: 3rem auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
}

dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.75rem 1.5rem;
  align-items: center;
  margin: 1.5rem 0;
}

dd {
  margin: 0;
}
</style>