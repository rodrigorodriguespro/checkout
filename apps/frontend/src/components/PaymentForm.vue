<template>
    <div class="max-w-md mt-5 mx-auto p-4 bg-white rounded shadow space-y-4">
        <div class="mb-4 p-3 bg-gray-100 rounded">
            <div class="font-semibold">Produto: Fone de Ouvido Bluetooth</div>
            <div class="text-gray-700">Descrição: Fone sem fio com cancelamento de ruído</div>
            <div class="text-lg font-bold mt-2">Valor: R$ {{ form.amount.toFixed(2) }}</div>
        </div>

        <h4 class="text-xl font-bold">Forma de Pagamento</h4>

        <div class="flex space-x-2">
            <button
                v-for="option in paymentOptions"
                :key="option.label"
                @click="selectMethod(option.label)"
                :disabled="paymentLocked"
                :class="[
                    'flex items-center px-4 py-3 rounded transition-colors',
                    method === option.label
                        ? 'bg-gray-300 text-blue-700 font-semibold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
            >
                <span class="mr-2 text-xl">
                    <component :is="option.icon" />
                </span>
                {{ option.label }}
            </button>
        </div>

        <div>
            <input
                v-model="amountInput"
                @input="onAmountInput"
                placeholder="Valor"
                class="w-full p-2 border rounded mb-2"
                inputmode="decimal"
                :disabled="paymentLocked"
            />
        </div>

        <!-- Cartão -->
        <div v-if="status === '' && method === 'Cartão'">
            <input
                v-model="form.name"
                placeholder="Nome do Titular"
                class="w-full p-2 border rounded mb-2"
                :class="{'border-red-500': nameError}"
            />
            <div v-if="nameError" class="text-red-600 text-sm mb-2">Nome do Titular é obrigatório.</div>
            <button class="w-full bg-black text-white py-2 rounded mt-3" @click="submit" :disabled="paymentLocked">Finalizar Compra</button>
        </div>

        <!-- Pix -->
        <div v-else-if="method === 'Pix' && !pixGenerated">
            <input
                v-model="form.name"
                placeholder="Nome do Pagador"
                class="w-full p-2 border rounded mb-2"
                :class="{'border-red-500': nameError}"
            />
            <div v-if="nameError" class="text-red-600 text-sm mb-2">Nome do Pagador é obrigatório.</div>
            <button class="w-full bg-black text-white py-2 rounded mt-3" @click="generatePix" :disabled="paymentLocked">Gerar Pix</button>
        </div>

        <div v-if="pixGenerated && method === 'Pix'">
            <img :src="`https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodeURIComponent(pixCode)}`" alt="QR Code" class="w-full mb-2" />
            <div class="flex items-center space-x-2">
                <input v-model="pixCode" readonly class="w-full p-2 border rounded" />
                <button class="bg-gray-100 px-4 py-2 rounded" @click="copyPix">Copiar</button>
            </div>
        </div>

        <div v-else-if="status === '' && method === 'Boleto'">
            <input
                v-model="form.name"
                placeholder="Nome do Pagador"
                class="w-full p-2 border rounded mb-2"
                :class="{'border-red-500': nameError}"
            />
            <div v-if="nameError" class="text-red-600 text-sm mb-2">Nome do Pagador é obrigatório.</div>
            <button class="w-full bg-black text-white py-2 rounded mt-3" @click="submit" :disabled="paymentLocked">Gerar Boleto</button>
        </div>

        <div v-if="status === 'pending'">
            <div class="mt-3 text-blue-600">⏳ Aguardando Pagamento...</div>
        </div>
        <div v-else-if="status === 'approved'">
            <div class="mt-3 text-green-600">✅ Pagamento Aprovado!</div>
        </div>
        <div v-else-if="status === 'failed'">
            <div class="mt-3 text-red-600">❌ Pagamento Falhou!</div>
        </div>
        <div v-if="paymentId" class="mt-3 text-gray-700 text-sm">
            <span class="font-semibold">ID da Transação:</span> {{ paymentId }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h, watch } from 'vue';
import { getToken, createPayment, getPaymentStatus } from '../api';

const CardIcon = defineComponent({
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            class: 'w-5 h-5',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
        }, [
            h('rect', { x: 2, y: 6, width: 20, height: 12, rx: 2, fill: 'currentColor', opacity: '0.1' }),
            h('rect', { x: 2, y: 6, width: 20, height: 12, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
            h('path', { d: 'M2 10h20', stroke: 'currentColor', 'stroke-width': 2 })
        ]);
    }
});
const PixIcon = defineComponent({
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            class: 'w-5 h-5',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
        }, [
            h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 6, fill: '#00B686', opacity: '0.2' }),
            h('rect', { x: 6, y: 6, width: 12, height: 12, rx: 6, stroke: '#00B686', 'stroke-width': 2 }),
            h('path', { d: 'M9 12h6', stroke: '#00B686', 'stroke-width': 2 })
        ]);
    }
});
const BoletoIcon = defineComponent({
    render() {
        return h('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            class: 'w-5 h-5',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
        }, [
            h('rect', { x: 4, y: 6, width: 16, height: 12, rx: 2, fill: 'currentColor', opacity: '0.1' }),
            h('rect', { x: 4, y: 6, width: 16, height: 12, rx: 2, stroke: 'currentColor', 'stroke-width': 2 }),
            h('path', { d: 'M7 10v4M10 10v4M13 10v4M16 10v4', stroke: 'currentColor', 'stroke-width': 1.5 })
        ]);
    }
});

function randomAmount() {
    return Math.floor(Math.random() * (50000 - 5000 + 1) + 5000) / 100;
}

const paymentOptions = [
    { label: 'Cartão', icon: CardIcon },
    { label: 'Pix', icon: PixIcon },
    { label: 'Boleto', icon: BoletoIcon }
];
const method = ref('Cartão');
const form = ref({
    name: '',
    amount: randomAmount(),
    method: 'cartao',
});
const status = ref('');
const paymentId = ref('');
const token = ref('');
const pixGenerated = ref(false);
const pixCode = ref('00020126380014BR.GOV.BCB.PIX0116tesstes@demo.com52040000530398654072532.005802BR5917DANIEL NASCIMENTO6006OLINDA62110507213563063048CE7');
const paymentLocked = ref(false);
const nameError = ref(false);
const pollingInterval = ref<number | null>(null);
const amountInput = ref(formatCurrency(form.value.amount));

onMounted(async () => {
    token.value = await getToken();
});

function formatCurrency(value: number|string) {
    let num = typeof value === 'number' ? value : Number(value.toString().replace(/\D/g, '')) / 100;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function parseCurrency(value: string) {
    const onlyNums = value.replace(/\D/g, '');
    return Number(onlyNums) / 100;
}

function onAmountInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const parsed = parseCurrency(input.value);
    form.value.amount = parsed;
    amountInput.value = formatCurrency(parsed);
}

watch(() => form.value.amount, (val) => {
    amountInput.value = formatCurrency(val);
});

function selectMethod(selectedMethod: string) {
    if (paymentLocked.value) return;
    method.value = selectedMethod;
    if (selectedMethod === 'Cartão') form.value.method = 'cartao';
    else if (selectedMethod === 'Pix') form.value.method = 'pix';
    else if (selectedMethod === 'Boleto') form.value.method = 'boleto';
    pixGenerated.value = false;
    status.value = '';
    paymentId.value = '';
}

async function startPolling() {
    stopPolling();
    pollingInterval.value = window.setInterval(async () => {
        if (paymentId.value && status.value === 'pending') {
            const result = await getPaymentStatus(paymentId.value, token.value);
            status.value = result.status;
            if (status.value !== 'pending') {
                stopPolling();
            }
        }
    }, 2000);
}

function stopPolling() {
    if (pollingInterval.value) {
        clearInterval(pollingInterval.value);
        pollingInterval.value = null;
    }
}

async function submit() {
    nameError.value = !form.value.name.trim();
    if (nameError.value) return;

    paymentLocked.value = true;
    const result = await createPayment(form.value, token.value);
    paymentId.value = result.id;
    status.value = result.status;
    if (status.value === 'pending') {
        startPolling();
    }
}

async function generatePix() {
    nameError.value = !form.value.name.trim();
    if (nameError.value) return;
    paymentLocked.value = true;
    pixGenerated.value = true;
    await submit();
}

function copyPix() {
    navigator.clipboard.writeText(pixCode.value);
}
</script>
