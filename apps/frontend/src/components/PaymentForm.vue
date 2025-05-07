<!-- src/components/PaymentMethod.vue -->
<template>
    <div class="max-w-md mt-5 mx-auto p-4 bg-white rounded shadow space-y-4">
        <!-- Produto mockado -->
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

        <div v-if="status === '' && (method === 'Cartão de Crédito' || method === 'Cartão de Débito')">
            <input
                v-model="form.name"
                placeholder="Nome do Titular"
                class="w-full p-2 border rounded mb-2"
                :class="{'border-red-500': nameError}"
            />
            <div v-if="nameError" class="text-red-600 text-sm mb-2">Nome do Titular é obrigatório.</div>
            <input
                v-model="form.cardNumber"
                placeholder="Número do Cartão"
                class="w-full p-2 border rounded mb-2"
                :class="{'border-red-500': cardNumberError}"
                maxlength="19"
                @input="onCardNumberInput"
            />
            <div v-if="cardNumberError" class="text-red-600 text-sm mb-2">Número do cartão inválido.</div>
            <div class="flex space-x-2 mb-2">
                <input
                    v-model="form.expiry"
                    placeholder="Validade (MM/AA)"
                    class="w-1/2 p-2 border rounded"
                    :class="{'border-red-500': expiryError}"
                    maxlength="5"
                    @input="onExpiryInput"
                />
                <input
                    v-model="form.cvv"
                    placeholder="CVV"
                    class="w-1/2 p-2 border rounded"
                    :class="{'border-red-500': cvvError}"
                    maxlength="4"
                    @input="onCvvInput"
                />
            </div>
            <div v-if="expiryError" class="text-red-600 text-sm mb-2">Validade inválida.</div>
            <div v-if="cvvError" class="text-red-600 text-sm mb-2">CVV inválido.</div>
            <button class="w-full bg-black text-white py-2 rounded mt-3" @click="submit" :disabled="paymentLocked">Finalizar Compra</button>
        </div>

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

        <div v-if="status === 'pending'">
            <div class="mt-3 text-blue-600">⏳ Aguardando Pagamento...</div>
        </div>
        <div v-else-if="status === 'approved'">
            <div class="mt-3 text-green-600">✅ Pagamento Aprovado!</div>
        </div>
        <div v-else-if="status === 'failed'">
            <div class="mt-3 text-red-600">❌ Pagamento Falhou!</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h } from 'vue';
import { getToken, createPayment, getPaymentStatus } from '../api';

// Ícones SVG inline
const CreditCardIcon = defineComponent({
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
const DebitCardIcon = defineComponent({
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
            h('circle', { cx: 8, cy: 16, r: 1.5, fill: 'currentColor' }),
            h('circle', { cx: 16, cy: 16, r: 1.5, fill: 'currentColor' })
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

function randomAmount() {
    return Math.floor(Math.random() * (50000 - 5000 + 1) + 5000) / 100;
}

const paymentOptions = [
    { label: 'Cartão de Crédito', icon: CreditCardIcon },
    { label: 'Cartão de Débito', icon: DebitCardIcon },
    { label: 'Pix', icon: PixIcon }
];
const method = ref('Cartão de Crédito');
const form = ref({
    name: '',
    amount: randomAmount(),
    method: 'credito',
    cardNumber: '',
    expiry: '',
    cvv: ''
});
const status = ref('');
const paymentId = ref('');
const token = ref('');
const pixGenerated = ref(false);
const pixCode = ref('00020126380014BR.GOV.BCB.PIX0116tesstes@demo.com52040000530398654072532.005802BR5917DANIEL NASCIMENTO6006OLINDA62110507213563063048CE7');
const paymentLocked = ref(false);
const nameError = ref(false);
const cardNumberError = ref(false);
const expiryError = ref(false);
const cvvError = ref(false);
const pollingInterval = ref<number | null>(null);

onMounted(async () => {
    token.value = await getToken();
});

function selectMethod(selectedMethod: string) {
    if (paymentLocked.value) return;
    method.value = selectedMethod;
    // Ajusta o valor enviado para a API conforme o método
    if (selectedMethod === 'Cartão de Crédito') form.value.method = 'credito';
    else if (selectedMethod === 'Cartão de Débito') form.value.method = 'debito';
    else if (selectedMethod === 'Pix') form.value.method = 'pix';
    pixGenerated.value = false;
    status.value = '';
    paymentId.value = '';
    // Limpa campos de cartão ao trocar método
    if (selectedMethod !== 'Cartão de Crédito' && selectedMethod !== 'Cartão de Débito') {
        form.value.cardNumber = '';
        form.value.expiry = '';
        form.value.cvv = '';
    }
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

// Máscara e validação para número do cartão
function onCardNumberInput(e: Event) {
    let value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    value = value.slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');
    form.value.cardNumber = value;
}
function validateCardNumber(num: string) {
    return /^\d{4} \d{4} \d{4} \d{4}$/.test(num);
}

// Máscara e validação para validade
function onExpiryInput(e: Event) {
    let value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) value = value.replace(/^(\d{2})(\d{1,2})/, '$1/$2');
    form.value.expiry = value;
}
function validateExpiry(expiry: string) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;
    const [mm, yy] = expiry.split('/').map(Number);
    return mm >= 1 && mm <= 12 && yy >= 0 && yy <= 99;
}

// Máscara e validação para CVV
function onCvvInput(e: Event) {
    let value = (e.target as HTMLInputElement).value.replace(/\D/g, '');
    value = value.slice(0, 4);
    form.value.cvv = value;
}
function validateCvv(cvv: string) {
    return /^\d{3,4}$/.test(cvv);
}

async function submit() {
    nameError.value = !form.value.name.trim();
    cardNumberError.value = (method.value === 'Cartão de Crédito' || method.value === 'Cartão de Débito') && !validateCardNumber(form.value.cardNumber);
    expiryError.value = (method.value === 'Cartão de Crédito' || method.value === 'Cartão de Débito') && !validateExpiry(form.value.expiry);
    cvvError.value = (method.value === 'Cartão de Crédito' || method.value === 'Cartão de Débito') && !validateCvv(form.value.cvv);

    if (nameError.value || cardNumberError.value || expiryError.value || cvvError.value) return;

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
