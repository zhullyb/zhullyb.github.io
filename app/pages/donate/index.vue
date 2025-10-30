<template>
	<DefaultLayout title="Donate to zhullyb">
		<div class="radio-group">
			<button
				:class="['radio-button', { active: selectedMethod === 'wechat' }]"
				@click="selectedMethod = 'wechat'"
			>
				WeChat Pay
			</button>
			<button
				:class="['radio-button', { active: selectedMethod === 'alipay' }]"
				@click="selectedMethod = 'alipay'"
			>
				AliPay
			</button>
		</div>

		<div class="divider"></div>
		<div class="text-container">
			<div class="donate-text">
				<p>全天24小时无人值守要饭，要饭我们是专业的。</p>
				<p>Unattended 7x24 hours ask for begging.</p>
				<p>To ask for begging, we are professional.</p>
			</div>
		</div>
		<div class="divider"></div>

		<div class="qrcode-container">
			<img
				v-if="selectedMethod === 'wechat'"
				:src="qrcodes.wechat"
				alt="WeChat Pay QR Code"
				class="qrcode-image"
			/>
			<img
				v-if="selectedMethod === 'alipay'"
				:src="qrcodes.alipay"
				alt="AliPay QR Code"
				class="qrcode-image"
			/>
		</div>
	</DefaultLayout>
</template>

<script setup lang="ts">
	import { ref } from 'vue'

	const selectedMethod = ref('wechat')

	const qrcodes = {
		wechat: 'https://static.031130.xyz/uploads/2024/08/12/6552d6098f397.webp',
		alipay: 'https://static.031130.xyz/uploads/2024/08/12/6552d6098f43c.webp'
	}

	useHead({
		link: [
			{
				rel: 'preload',
				as: 'image',
				href: qrcodes.wechat,
				fetchpriority: 'high'
			},
			{
				rel: 'preload',
				as: 'image',
				href: qrcodes.alipay
			}
		]
	})
</script>

<style scoped lang="less">
	.text-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.donate-text {
		p {
			margin: 8px 0;
			color: #606266;
			line-height: 1.6;

			.dark-mode({
				color: #ccc;
			});
		}
	}

	.divider {
		height: 1px;
		background: #dcdfe6;
		margin: 24px 0;

		.dark-mode({
			background: #4c4d4f;
		});
	}

	.radio-group {
		display: flex;
		justify-content: center;
		gap: 0;
		margin: 20px 0;
		flex-wrap: wrap;
	}

	.radio-button {
		padding: 12px 20px;
		border: 1px solid #dcdfe6;
		background: white;
		color: #606266;
		cursor: pointer;
		transition: all 0.3s;
		font-size: 14px;
		margin: 0;

		&:not(:first-child) {
			border-left: none;
		}

		&:hover {
			color: #409eff;
			border-color: #c6e2ff;
			background: #ecf5ff;
		}

		&.active {
			background: #409eff;
			color: white;
			border-color: #409eff;

			&:hover {
				background: #66b1ff;
				border-color: #66b1ff;
			}
		}

		.dark-mode({
			background: #2c2c2c;
			color: #ccc;
			border-color: #4c4d4f;

			&:hover {
				background: #3a3a3a;
				border-color: #409eff;
				color: #409eff;
			}

			&.active {
				background: #409eff;
				color: white;
				border-color: #409eff;
			}
		});

		@media (max-width: 768px) {
			flex: 1;
			padding: 10px 12px;
			font-size: 13px;

			&:not(:first-child) {
				border-left: 1px solid #dcdfe6;
				border-top: none;

				.dark-mode({
					border-left: 1px solid #4c4d4f;
				});
			}
		}
	}

	.qrcode-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 300px;
	}

	.qrcode-image {
		max-width: 400px;
		width: 100%;
		height: auto;
		border-radius: 4px;
		transition: transform 0.3s ease;

		&:hover {
			transform: scale(1.02);
		}

		@media (max-width: 768px) {
			max-width: 100%;
		}
	}
</style>
