<template>
  <div class="promo-card">
    <div class="card-header">
      <div class="header-left">
        <div class="logo-yxvm-container">
          <a href="https://yxvm.com/" target="_blank" rel="noopener noreferrer">
            <img src="https://static.031130.xyz/uploads/2025/11/25/2584c5a5ec26b.png" alt="yxvm" class="logo-img">
          </a>
        </div>
        <span class="plus-separator">+</span>
        <div class="logo-nodeseek-container">
          <a href="https://www.nodeseek.com" target="_blank" rel="noopener noreferrer">
            <img src="https://static.031130.xyz/uploads/2025/11/25/f56e28d4d53ca.png" alt="nodeseek" class="logo-img">
          </a>
        </div>
      </div>
      <div>
        <a href="https://github.com/NodeSeekDev/NodeSupport" target="_blank" rel="noopener noreferrer" class="github-link">
          <svg class="github-icon" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"
              version="1.1" viewBox="0 0 20 20">
            <g stroke-width="0" id="SVGRepo_bgCarrier"></g>
            <g stroke-linejoin="round" stroke-linecap="round" id="SVGRepo_tracerCarrier"></g>
            <g id="SVGRepo_iconCarrier">
              <title>github [#142]</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g stroke-width="1" stroke="none" id="Page-1">
                <g transform="translate(-140.000000, -7559.000000)" id="Dribbble-Light-Preview">
                  <g transform="translate(56.000000, 160.000000)" id="icons">
                    <path id="github-[#142]"
                        d="M94,7399 C99.523,7399 104,7403.59 104,7409.253 C104,7413.782 101.138,7417.624 97.167,7418.981 C96.66,7419.082 96.48,7418.762 96.48,7418.489 C96.48,7418.151 96.492,7417.047 96.492,7415.675 C96.492,7414.719 96.172,7414.095 95.813,7413.777 C98.04,7413.523 100.38,7412.656 100.38,7408.718 C100.38,7407.598 99.992,7406.684 99.35,7405.966 C99.454,7405.707 99.797,7404.664 99.252,7403.252 C99.252,7403.252 98.414,7402.977 96.505,7404.303 C95.706,7404.076 94.85,7403.962 94,7403.958 C93.15,7403.962 92.295,7404.076 91.497,7404.303 C89.586,7402.977 88.746,7403.252 88.746,7403.252 C88.203,7404.664 88.546,7405.707 88.649,7405.966 C88.01,7406.684 87.619,7407.598 87.619,7408.718 C87.619,7412.646 89.954,7413.526 92.175,7413.785 C91.889,7414.041 91.63,7414.493 91.54,7415.156 C90.97,7415.418 89.522,7415.871 88.63,7414.304 C88.63,7414.304 88.101,7413.319 87.097,7413.247 C87.097,7413.247 86.122,7413.234 87.029,7413.87 C87.029,7413.87 87.684,7414.185 88.139,7415.37 C88.139,7415.37 88.726,7417.2 91.508,7416.58 C91.513,7417.437 91.522,7418.245 91.522,7418.489 C91.522,7418.76 91.338,7419.077 90.839,7418.982 C86.865,7417.627 84,7413.783 84,7409.253 C84,7403.59 88.478,7399 94,7399">
                    </path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </a>
      </div>
    </div>
    <h1 class="card-title">
      NodeSupport Project
    </h1>
    <p class="card-description">
      Provide free server sponsorship to high-quality blogs, channels, open-source projects, and popular app.
    </p>
    <div class="card-footer">
      <span>Support ID:</span>
      <span>{{ supportId }}</span>
    </div>
  </div>
</template>

<script setup>
const supportId = ref('61');
</script>

<style lang="less" scoped>
.promo-card {
  zoom: 0.8;
  box-sizing: border-box;
  padding: 24px;
  border: 0.5px solid #eee;
  background: rgba(0, 0, 0, 0.2);
  max-width: 310px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-img {
  display: block;
  width: 100%;
  height: auto;
}

.logo-yxvm-container {
  width: 100px;
  margin-left: 2px;
}

.plus-separator {
  color: white;
  font-weight: 700;
  font-size: 20px;
}

.logo-nodeseek-container {
  width: 40px;
}

.github-link {
  display: block;
  width: 20px;
  color: #fff;
  transition: color 200ms ease-in-out;

  &:hover {
    color: #38bdf8;
  }
}

.github-icon {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.card-title {
  text-transform: capitalize;
  color: white;
  font-weight: 500;
  font-size: 18px;
  margin: 0;
  line-height: 1.2;
}

.card-description {
  color: #94a3b8;
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  font-size: 13px;
  color: #e4e4e7;
  font-weight: 500;
}
</style>
