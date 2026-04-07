<template>
  <DefaultLayout :title="pageTitle">
    <div class="radio-group">
      <button
        v-for="method in methods"
        :key="method.key"
        :class="['radio-button', { active: selectedMethod === method.key }]"
        @click="selectedMethod = method.key"
      >
        {{ method.label }}
      </button>
    </div>

    <div class="divider"></div>
    <div class="text-container">
      <div class="donate-text">
        <p v-for="line in introLines" :key="line">{{ line }}</p>
      </div>
    </div>
    <div class="divider"></div>

    <div class="qrcode-container">
      <img v-if="selectedQrCode" :src="selectedQrCode" :alt="selectedAlt" class="qrcode-image" />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
  const appConfig = useAppConfig()
  const localeKey = useBlogLocaleKey()
  const donateConfig = appConfig.pages.donate
  const selectedMethod = ref(donateConfig.methods[0]?.key ?? '')

  const pageTitle = computed(() => donateConfig.title[localeKey.value])
  const introLines = computed(() => donateConfig.intro[localeKey.value])
  const methods = computed(() =>
    donateConfig.methods.map(method => ({
      ...method,
      label: method.label[localeKey.value],
      alt: method.alt[localeKey.value]
    }))
  )
  const selectedMethodConfig = computed(
    () => methods.value.find(method => method.key === selectedMethod.value) ?? methods.value[0]
  )
  const selectedQrCode = computed(() => selectedMethodConfig.value?.qrCode ?? '')
  const selectedAlt = computed(() => selectedMethodConfig.value?.alt ?? '')

  watchEffect(() => {
    if (!methods.value.find(method => method.key === selectedMethod.value)) {
      selectedMethod.value = methods.value[0]?.key ?? ''
    }
  })

  useHead(() => ({
    link: donateConfig.methods.map((method, index) => ({
      rel: 'preload',
      as: 'image',
      href: method.qrCode,
      ...(index === 0 ? { fetchpriority: 'high' } : {})
    }))
  }))
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
