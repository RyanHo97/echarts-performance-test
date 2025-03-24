import * as echarts from 'echarts';

// 全局状态
let charts = [];
let fpsLastTime = performance.now();
let fpsFrames = 0;

// 性能监控
function startFPSMonitor() {
  function checkFPS() {
    const now = performance.now();
    const delta = now - fpsLastTime;
    fpsFrames++;

    if (delta >= 1000) {
      const fps = Math.round((fpsFrames * 1000) / delta);
      document.getElementById('fps').textContent = `FPS: ${fps}`;
      fpsLastTime = now;
      fpsFrames = 0;
    }
    requestAnimationFrame(checkFPS);
  }
  checkFPS();
}

// 创建测试图表（添加容器尺寸验证）
function createChart(container, renderer, data) {
  // 确保容器已渲染且具有有效尺寸
  if (container.clientWidth === 0 || container.clientHeight === 0) {
    console.error('容器尺寸异常，请检查 DOM 可见性');
    return null;
  }
  
  const chart = echarts.init(container, null, { renderer });
  chart.setOption({
    dataset: { source: data },
    xAxis: { type: 'value' },
    yAxis: { type: 'value' },
    series: [{ type: 'scatter' }]
  });
  return chart;
}

// 大数据测试（添加延迟重试机制）
function testBigData(renderer, dataSize) {
  clearCharts();
  const data = Array.from({ length: dataSize }, (_, i) => [i, Math.random() * 100]);
  
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '400px';
  document.body.appendChild(container);

  // 延迟初始化确保容器已渲染
  setTimeout(() => {
    const startTime = performance.now();
    const chart = createChart(container, renderer, data);
    if (!chart) return;

    const renderTime = performance.now() - startTime;
    document.getElementById('renderTime').textContent = 
      `渲染时间: ${renderTime.toFixed(2)}ms`;
    charts.push(chart);
  }, 50);
}

// 多实例测试（添加容器预检）
function testMassInstances(renderer, instanceCount) {
  clearCharts();
  const container = document.getElementById('charts-container');
  
  // 验证父容器可见性
  if (container.offsetParent === null) {
    console.error('charts-container 容器不可见');
    return;
  }

  const startTime = performance.now();
  for (let i = 0; i < instanceCount; i++) {
    const div = document.createElement('div');
    div.className = 'chart-item';
    div.style.width = '300px';
    div.style.height = '200px';  // 明确设置子容器尺寸
    container.appendChild(div);
    
    const chart = createChart(div, renderer, [[i % 10, Math.random() * 100]]);
    if (!chart) continue;
    charts.push(chart);
  }
  
  const renderTime = performance.now() - startTime;
  document.getElementById('renderTime').textContent = 
    `总渲染时间: ${renderTime.toFixed(2)}ms`;
}

// 清理图表
function clearCharts() {
  charts.forEach(chart => chart.dispose());
  charts = [];
  const container = document.getElementById('charts-container');
  if (container) container.innerHTML = '';
}

// 统一测试入口（添加安全校验）
function runTest(testType, renderer) {
  if (!document.getElementById('charts-container')) {
    console.error('找不到 charts-container 容器');
    return;
  }

  document.getElementById('status').textContent = '测试运行中...';
  
  const instanceCount = parseInt(document.getElementById('instanceCount').value) || 100;
  const dataSize = parseInt(document.getElementById('dataSize').value) || 10000;

  if (testType === 'massInstances') {
    testMassInstances(renderer, instanceCount);
  } else if (testType === 'bigData') {
    testBigData(renderer, dataSize);
  }

  setTimeout(() => {
    document.getElementById('status').textContent = '状态: 空闲';
  }, 500);
}

// 所有 DOM 相关操作在加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
  // 启动性能监控
  startFPSMonitor();

  // 挂载函数到 window 对象
  window.runTest = runTest;
  window.clearCharts = clearCharts;

  // 初始化状态显示
  document.getElementById('status').textContent = '状态: 就绪';

  // 确保测试容器可见
  const container = document.getElementById('charts-container');
  if (container) {
    container.style.display = 'flex';  // 显式设置布局
  }
});