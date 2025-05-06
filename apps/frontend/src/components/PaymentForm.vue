<template>
    <div class="max-w-md mx-auto p-4 bg-white rounded shadow space-y-4">
        <h2 class="text-xl font-bold">Simular Pagamento</h2>

        <form @submit.prevent="submit">
            <input v-model="form.name" placeholder="Nome" class="input" />
            <input v-model.number="form.amount" type="number" placeholder="Valor" class="input" />
            <select v-model="form.method" class="input">
                <option disabled value="">Método de pagamento</option>
                <option value="pix">Pix</option>
                <option value="boleto">Boleto</option>
                <option value="cartao">Cartão</option>
            </select>
            <button class="bg-blue-600 text-white px-4 py-2 rounded">Enviar</button>
        </form>

        <div v-if="payment">
            <p class="flex items-center gap-2">
                <strong>Status:</strong>
                <span v-if="status === 'pending'">⏳ Pendente</span>
                <span v-else-if="status === 'approved'">✅ Aprovado</span>
                <span v-else-if="status === 'failed'">❌ Falhou</span>
            </p>
        </div>
        <div v-if="error" class="text-red-600">{{ error }}</div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { getToken, createPayment, getPaymentStatus } from '../api'

const form = ref({
    name: '',
    amount: 0,
    method: ''
})

const token = ref('')
const payment = ref<{ id: string } | null>(null)
const status = ref('')
const error = ref('')

async function submit() {
    error.value = ''
    if (!token.value) {
        error.value = 'Token não carregado'
        return
    }
    try {
        const result = await createPayment(form.value, token.value)
        payment.value = result
        status.value = result.status
    } catch (e: any) {
        error.value = e?.message || 'Erro ao criar pagamento'
        console.error(e)
    }
}

async function pollStatus() {
    if (payment.value?.id && token.value) {
        try {
            const res = await getPaymentStatus(payment.value.id, token.value)
            status.value = res.status
        } catch (e) {
            console.error(e)
        }
    }
}

onMounted(async () => {
    token.value = await getToken()
    setInterval(pollStatus, 2000)
})
</script>

<style scoped>
.input {
    @apply block w-full p-2 border rounded mb-2;
}
</style>
