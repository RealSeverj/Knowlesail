<script setup>
import { ref, watchEffect, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
	modelValue: {
		type: Boolean,
		required: true
	},
	/**
	 * 弹出层相对触发元素的位置 class
	 * 默认右上角浮出菜单
	 */
	popClass: {
		type: String,
		default: 'absolute right-2 top-8 z-20'
	},
	/**
	 * 是否显示全屏遮罩（适配移动端点击空白关闭）
	 */
	overlay: {
		type: Boolean,
		default: true
	},
	/**
	 * 弹出层宽度类
	 */
	widthClass: {
		type: String,
		default: 'w-40'
	}
})

const emit = defineEmits(['update:modelValue'])

const visible = ref(props.modelValue)

watchEffect(() => {
	visible.value = props.modelValue
})

function close() {
	emit('update:modelValue', false)
}

function handleOverlayClick() {
	close()
}

// 键盘 ESC 关闭（可选增强）
function handleKeydown(e) {
	if (e.key === 'Escape' && visible.value) {
		close()
	}
}

onMounted(() => {
	window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
	window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
	<!-- 遮罩层 -->
	<transition name="fade-overlay">
		<div
			v-if="overlay && visible"
			class="fixed inset-0 z-10"
			@click="handleOverlayClick"
		/>
	</transition>

	<!-- 弹出菜单主体 -->
	<transition name="actions-pop">
		<div
			v-if="visible"
			:class="[
				popClass,
				widthClass,
				'rounded-xl bg-[var(--color-surface)] p-2 text-[12px] shadow-lg'
			]"
		>
			<slot />
		</div>
	</transition>
</template>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
	transition: opacity 0.18s ease;
}

.fade-overlay-enter-from,
.fade-overlay-leave-to {
	opacity: 0;
}

.actions-pop-enter-active,
.actions-pop-leave-active {
	transition: opacity 0.18s ease, transform 0.18s ease;
}

.actions-pop-enter-from,
.actions-pop-leave-to {
	opacity: 0;
	transform: translateY(-4px) scale(0.96);
}
</style>
