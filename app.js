// GPU参数比较应用
class GPUComparisonApp {
    constructor() {
        this.filteredGPUs = [...gpuData];
        this.sortColumn = null;
        this.sortDirection = 'asc'; // 'asc' or 'desc'
        this.selectedGPUs = [];
        this.init();
    }

    init() {
        this.renderGPUs();
        this.setupEventListeners();
        this.initComparisonFeature();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 筛选按钮
        document.getElementById('filter-btn').addEventListener('click', () => this.applyFilters());
        
        // 重置按钮
        document.getElementById('reset-btn').addEventListener('click', () => this.resetFilters());
        
        // 搜索框实时筛选
        document.getElementById('search').addEventListener('input', () => this.applyFilters());
        
        // 排序功能
        document.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.column;
                this.sortByColumn(column);
            });
        });
    }

    // 初始化对比功能
    initComparisonFeature() {
        // 为所有品牌选择器添加事件监听器
        document.querySelectorAll('.compare-vendor').forEach((select, index) => {
            select.addEventListener('change', (e) => {
                this.populateModels(e.target.value, index + 1);
            });
        });

        // 为移除按钮添加事件监听器
        document.querySelectorAll('.remove-gpu').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeGPU(index);
            });
        });

        // 为对比按钮添加事件监听器
        document.getElementById('compare-btn').addEventListener('click', () => {
            this.compareGPUs();
        });
    }

    // 根据选择的品牌填充型号列表
    populateModels(vendor, gpuIndex) {
        const modelSelect = document.getElementById(`compare-model-${gpuIndex}`);
        
        // 清空现有选项
        modelSelect.innerHTML = '<option value="">选择型号</option>';
        
        // 根据品牌筛选GPU型号
        const models = gpuData.filter(gpu => gpu.vendor === vendor);
        
        // 添加型号选项
        models.forEach(gpu => {
            const option = document.createElement('option');
            option.value = gpu.model;
            option.textContent = gpu.model;
            modelSelect.appendChild(option);
        });
    }

    // 移除指定的GPU
    removeGPU(index) {
        // 清空对应的选择器
        document.getElementById(`compare-vendor-${index}`).value = '';
        document.getElementById(`compare-model-${index}`).innerHTML = '<option value="">选择型号</option>';
        
        // 重新渲染对比结果
        this.compareGPUs();
    }

    // 对比选中的GPU
    compareGPUs() {
        // 获取选中的GPU
        const gpusToCompare = [];
        
        for (let i = 1; i <= 3; i++) {
            const vendor = document.getElementById(`compare-vendor-${i}`).value;
            const model = document.getElementById(`compare-model-${i}`).value;
            
            if (vendor && model) {
                const gpu = gpuData.find(g => g.vendor === vendor && g.model === model);
                if (gpu) {
                    gpusToCompare.push(gpu);
                }
            }
        }
        
        // 渲染对比结果
        this.renderComparison(gpusToCompare);
    }

    // 渲染对比结果
    renderComparison(gpus) {
        const resultContainer = document.getElementById('comparison-result');
        
        if (gpus.length === 0) {
            resultContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">请选择至少一个GPU进行对比</p>';
            return;
        }
        
        // 创建对比表格
        let html = '<table class="comparison-table">';
        
        // 表头：GPU名称
        html += '<thead><tr>';
        html += '<th>参数</th>';
        gpus.forEach((gpu, index) => {
            html += `<th>GPU ${index + 1}<br><strong>${gpu.vendor} ${gpu.model}</strong></th>`;
        });
        html += '</tr></thead>';
        
        // 表格内容
        html += '<tbody>';
        
        // 定义要对比的参数
        const params = [
            { key: 'architecture', label: '架构' },
            { key: 'mainScenes', label: '主要场景', formatter: (val) => val.join(', ') },
            { key: 'fp64TFlops', label: 'FP64 TFLOPS', formatter: (val) => val ? val + ' TFLOPS' : '-' },
            { key: 'fp32TFlops', label: 'FP32 TFLOPS', formatter: (val) => val ? val + ' TFLOPS' : '-' },
            { key: 'fp16TensorCoreTFlops', label: 'FP16 TFLOPS', formatter: (val) => val ? val + ' TFLOPS' : '-' },
            { key: 'fp8TensorCoreTFlops', label: 'FP8 TFLOPS', formatter: (val) => val ? val + ' TFLOPS' : '-' },
            { key: 'int8TensorCoreTOps', label: 'INT8 TOPS', formatter: (val) => val ? val + ' TOPS' : '-' },
            { key: 'memorySizeGB', label: '显存大小', formatter: (val) => val ? val + ' GB' : '-' },
            { key: 'memoryType', label: '显存类型', formatter: (val) => val || '-' },
            { key: 'memoryBandwidthGBs', label: '显存带宽', formatter: (val) => val ? val + ' GB/s' : '-' },
            { key: 'memoryBusWidth', label: '显存位宽', formatter: (val) => val || '-' },
            { key: 'interCardConnection', label: '卡间连接', formatter: (val) => val || '-' },
            { key: 'pcieConnection', label: 'PCIe连接', formatter: (val) => val || '-' },
            { key: 'maxPowerW', label: '最大功耗', formatter: (val) => val ? val + 'W' : '-' }
        ];
        
        // 渲染参数行
        params.forEach(param => {
            html += '<tr>';
            html += `<td>${param.label}</td>`;
            
            gpus.forEach(gpu => {
                const value = gpu[param.key];
                const displayValue = param.formatter ? param.formatter(value) : value;
                html += `<td>${displayValue}</td>`;
            });
            
            html += '</tr>';
        });
        
        html += '</tbody>';
        html += '</table>';
        
        resultContainer.innerHTML = html;
    }

    // 渲染GPU列表
    renderGPUs() {
        const tbody = document.getElementById('gpu-body');
        tbody.innerHTML = '';

        if (this.filteredGPUs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="empty-state">没有找到匹配的GPU数据</td></tr>';
            return;
        }

        this.filteredGPUs.forEach(gpu => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${gpu.vendor}</td>
                <td>${gpu.model}</td>
                <td>${gpu.mainScenes.join(', ')}</td>
                <td>${gpu.memoryBandwidthGBs ? gpu.memoryBandwidthGBs + ' GB/s' : '-'}</td>
                <td>${gpu.fp64TFlops ? gpu.fp64TFlops + ' TFLOPS' : '-'}</td>
                <td>${gpu.fp32TFlops ? gpu.fp32TFlops + ' TFLOPS' : '-'}</td>
                <td>${gpu.fp16TensorCoreTFlops ? gpu.fp16TensorCoreTFlops + ' TFLOPS' : '-'}</td>
                <td>${gpu.fp8TensorCoreTFlops ? gpu.fp8TensorCoreTFlops + ' TFLOPS' : '-'}</td>
                <td>${gpu.int8TensorCoreTOps ? gpu.int8TensorCoreTOps + ' TOPS' : '-'}</td>
                <td>${gpu.memorySizeGB ? gpu.memorySizeGB + ' GB' : '-'}</td>
                <td>${gpu.maxPowerW ? gpu.maxPowerW + 'W' : '-'}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // 应用筛选条件
    applyFilters() {
        const brand = document.getElementById('brand').value;
        const type = document.getElementById('type').value;
        const search = document.getElementById('search').value.toLowerCase();

        this.filteredGPUs = gpuData.filter(gpu => {
            const matchesBrand = !brand || gpu.vendor === brand;
            const matchesType = !type || gpu.mainScenes.includes(type);
            const matchesSearch = !search || 
                gpu.model.toLowerCase().includes(search) ||
                gpu.vendor.toLowerCase().includes(search);

            return matchesBrand && matchesType && matchesSearch;
        });

        // 应用排序
        this.applySorting();
        this.renderGPUs();
    }
    
    // 排序功能
    sortByColumn(column) {
        // 切换排序方向或设置新的排序列
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }
        
        // 更新排序指示器
        this.updateSortIndicators();
        
        // 应用排序
        this.applySorting();
        this.renderGPUs();
    }
    
    // 应用排序
    applySorting() {
        if (!this.sortColumn) return;
        
        this.filteredGPUs.sort((a, b) => {
            const aVal = a[this.sortColumn];
            const bVal = b[this.sortColumn];
            
            // 处理null值，默认放在最后
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;
            
            // 数值比较
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                if (this.sortDirection === 'asc') {
                    return aVal - bVal;
                } else {
                    return bVal - aVal;
                }
            }
            
            return 0;
        });
    }
    
    // 更新排序指示器
    updateSortIndicators() {
        // 移除所有排序类
        document.querySelectorAll('th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        // 确保排序指示器元素存在
        document.querySelectorAll('.sortable').forEach(th => {
            let indicator = th.querySelector('.sort-indicator');
            if (!indicator) {
                indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.textContent = '↕';
                th.appendChild(indicator);
            }
        });
        
        // 添加当前排序类
        if (this.sortColumn) {
            const th = document.querySelector(`[data-column="${this.sortColumn}"]`);
            if (th) {
                th.classList.add(this.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc');
            }
        }
    }

    // 重置筛选条件
    resetFilters() {
        document.getElementById('brand').value = '';
        document.getElementById('type').value = '';
        document.getElementById('search').value = '';
        
        // 重置排序状态
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.updateSortIndicators();

        this.filteredGPUs = [...gpuData];
        this.renderGPUs();
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new GPUComparisonApp();
});

// 添加一些交互效果
document.addEventListener('DOMContentLoaded', () => {
    // 为所有按钮添加悬停效果
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // 为筛选条件添加变化监听，自动应用筛选
    const filters = ['brand', 'memory', 'type'];
    filters.forEach(filterId => {
        const element = document.getElementById(filterId);
        if (element) {
            element.addEventListener('change', () => {
                // 延迟执行，避免频繁筛选
                clearTimeout(window.filterTimeout);
                window.filterTimeout = setTimeout(() => {
                    const app = window.gpuApp || new GPUComparisonApp();
                    app.applyFilters();
                }, 300);
            });
        }
    });

    // 保存应用实例到全局，方便调试
    window.gpuApp = new GPUComparisonApp();
});