<template>
  <Transition name="modal-fade">
    <div v-if="open" class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="header-text">
            <h3>Actualizar contraseña</h3>
            <p class="subtitle">Define una nueva clave para el usuario</p>
          </div>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <label class="field full-width">
              <span>Nueva contraseña</span>
              <div class="password-wrap">
                <input
                  :type="showPass ? 'text' : 'password'"
                  v-model="password"
                  placeholder="••••••••"
                />
                <button class="toggle" type="button" @click="showPass = !showPass">
                  {{ showPass ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
            </label>

            <label class="field full-width">
              <span>Confirmar contraseña</span>
              <div class="password-wrap">
                <input
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="confirm"
                  placeholder="••••••••"
                />
                <button class="toggle" type="button" @click="showConfirm = !showConfirm">
                  {{ showConfirm ? 'Ocultar' : 'Ver' }}
                </button>
              </div>
              <small v-if="password && confirm && !isMatch" class="hint-error">
                Las contraseñas no coinciden
              </small>
            </label>
          </div>
        </div>

        <div class="actions">
          <button class="btn-ghost" @click="$emit('close')">Cancelar</button>
          <button class="btn-primary" :disabled="saving || !canSave" @click="emitSave">
            {{ saving ? 'Actualizando...' : 'Actualizar contraseña' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  open: Boolean,
  saving: Boolean,
  user: Object,
});
const emit = defineEmits(["close", "save"]);

const password = ref("");
const confirm = ref("");
const showPass = ref(false);
const showConfirm = ref(false);

const isMatch = computed(() => password.value === confirm.value);
const canSave = computed(() => password.value.length > 0 && confirm.value.length > 0 && isMatch.value);

watch(
  () => props.open,
  (val) => {
    if (val) {
      password.value = "";
      confirm.value = "";
      showPass.value = false;
      showConfirm.value = false;
    }
  },
  { immediate: true }
);

const emitSave = () => {
  if (!canSave.value) return;
  emit("save", { password: password.value });
};
</script>

<style scoped>
.modal-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.4); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 100; }
.modal { width: min(540px, 96vw); background: white; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.1); display: flex; flex-direction: column; max-height: 90vh; }
.modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
.header-text h3 { margin: 0; font-size: 1.1rem; font-weight: 800; color: #0f172a; }
.subtitle { margin: 4px 0 0; color: #64748b; font-size: 0.9rem; }
.btn-close { background: transparent; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
.modal-body { padding: 20px 24px; overflow-y: auto; }
.form-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field span { font-size: 0.8rem; font-weight: 700; color: #475569; }
.password-wrap { display: flex; gap: 8px; align-items: center; }
.password-wrap input { flex: 1; padding: 10px 12px; border-radius: 10px; border: 1px solid #e2e8f0; background: #f8fafc; font-size: 0.95rem; }
.toggle { border: 1px solid #e2e8f0; background: #fff; padding: 9px 12px; border-radius: 10px; cursor: pointer; font-weight: 600; color: #334155; }
.hint-error { color: #b91c1c; font-size: 0.8rem; }
.actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e2e8f0; background: #f8fafc; }
.btn-ghost { border: none; background: transparent; color: #64748b; padding: 10px 18px; cursor: pointer; font-weight: 600; }
.btn-primary { border: none; background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 10px 18px; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
