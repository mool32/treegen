import React, { useState, useRef, useEffect, useCallback } from 'react';

const TreeGenerator = () => {
  const canvasRef = useRef(null);
  const [activeHelp, setActiveHelp] = useState(null);
  const [showNatureHelp, setShowNatureHelp] = useState(false);
  const [settings, setSettings] = useState({
    depth: 7,
    branches: 2,
    angle: 45,
    scale: 0.7,
    curvature: 0.2,
    distributedBranching: false,
    colorPalette: 0,
    leaves: true
  });

  const colorPalettes = [
    { 
      name: "Классика", 
      trunk: { hue: 25, sat: 40 }, 
      leaves: { hue: 115, sat: 60 } 
    },
    { 
      name: "Осень", 
      trunk: { hue: 25, sat: 50 }, 
      leaves: { hue: 25, sat: 70 } 
    },
    { 
      name: "Зима", 
      trunk: { hue: 220, sat: 15 }, 
      leaves: { hue: 200, sat: 30 } 
    },
    { 
      name: "Сакура", 
      trunk: { hue: 25, sat: 20 }, 
      leaves: { hue: 320, sat: 40 } 
    }
  ];

  const natureHelp = {
    depth: {
      title: "Глубина ветвления",
      content: "Количество поколений ветвей определяет возраст и зрелость дерева. Молодые саженцы имеют всего 2-3 уровня ветвления, взрослые дубы могут достигать 8-12 уровней. Каждое новое поколение ветвей появляется по мере роста дерева и его потребности в большей площади для листьев."
    },
    branches: {
      title: "Количество основных ветвей", 
      content: "Разные виды деревьев имеют характерные схемы ветвления. Хвойные часто растут одним центральным стволом с мутовками ветвей. Лиственные деревья как дубы и клены развивают несколько мощных основных ветвей. Это определяется генетикой и условиями роста."
    },
    branching: {
      title: "Типы ветвления",
      content: "Хвойные деревья (ели, сосны) растут по принципу 'терминального роста' - ветви только из концов побегов. Лиственные деревья могут давать боковые побеги вдоль всего ствола, создавая более густую крону для максимального захвата света."
    },
    leaves: {
      title: "Листья и крона",
      content: "Листья размещаются на концах ветвей там, где больше света и пространства для фотосинтеза. Дерево 'знает' где разместить листья для максимальной эффективности - это результат миллионов лет эволюции и оптимизации."
    },
    angle: {
      title: "Угол между ветвями",
      content: "Угол ветвления - это адаптация к среде. Ели имеют острые углы (30-40°) чтобы снег скатывался с веток. Дубы растут широко (90-120°) для максимального захвата солнечного света. Тропические деревья часто имеют горизонтальные ветви для защиты от дождя."
    },
    scale: {
      title: "Пропорции ветвей",
      content: "Дочерние ветви обычно составляют 60-80% от размера родительской ветви. Это золотое правило природы обеспечивает структурную прочность дерева и эффективное распределение питательных веществ от корней к листьям через сосудистую систему."
    },
    curvature: {
      title: "Изгибы и кривизна",
      content: "Ветви изгибаются под воздействием света (фототропизм), гравитации (геотропизм) и механических сил. Молодые ветки тянутся к свету, изгибаются под весом плодов, адаптируются к преобладающим ветрам. Каждая кривая рассказывает историю жизни дерева."
    },
    davinci: {
      title: "Принцип Леонардо да Винчи",
      content: "Леонардо да Винчи открыл, что сумма площадей поперечных сечений всех ветвей на любом уровне равна площади ствола. Это обеспечивает оптимальный поток питательных веществ. В нашем генераторе толщина дочерних ветвей вычисляется как родительская толщина делённая на корень из количества ветвей."
    },
    evolution: {
      title: "Естественное убывание ветвей",
      content: "В природе количество ветвей обычно уменьшается с каждым уровнем - это обеспечивает устойчивость кроны и эффективное распределение ресурсов. Мы используем коэффициент -15% для имитации этого естественного процесса, создавая реалистичную структуру дерева."
    },
    symmetry: {
      title: "Симметричное ветвление", 
      content: "Деревья стремятся к симметрии для равномерного распределения нагрузки и оптимального захвата света. При двух ветвях они отклоняются на равные углы в разные стороны от центральной оси, создавая устойчивую Y-образную структуру."
    }
  };

  const drawBranch = (ctx, startX, startY, angle, length, thickness, currentDepth, maxDepth) => {
    if (currentDepth <= 0 || length < 2) {
      // Рисуем листья если включены и это конечная ветвь
      if (settings.leaves && (currentDepth <= 1 || length < 3)) {
        const palette = colorPalettes[settings.colorPalette];
        const leafHue = palette.leaves.hue;
        const leafSat = palette.leaves.sat;
        const leafLight = 70;
        
        ctx.fillStyle = `hsl(${leafHue}, ${leafSat}%, ${leafLight}%)`;
        ctx.beginPath();
        ctx.arc(startX, startY, Math.random() * 3 + 2, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    const segments = Math.max(4, Math.floor(length / 8));
    const segmentLength = length / segments;
    let currentX = startX;
    let currentY = startY;
    let currentAngle = angle;

    // Цвет в зависимости от выбранной палитры
    const intensity = (currentDepth / maxDepth);
    const palette = colorPalettes[settings.colorPalette];
    
    const hue = palette.trunk.hue + (palette.leaves.hue - palette.trunk.hue) * (1 - intensity);
    const saturation = palette.trunk.sat + (palette.leaves.sat - palette.trunk.sat) * (1 - intensity);
    const lightness = 25 + (55 * intensity);
    
    ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.lineWidth = Math.max(0.8, thickness);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(currentX, currentY);

    // Рисуем изогнутую ветку и сохраняем все точки пути
    const pathPoints = [{ x: currentX, y: currentY }];
    
    for (let i = 0; i < segments; i++) {
      const curvatureAmount = settings.curvature * 0.4;
      const randomCurve = (Math.random() - 0.5) * curvatureAmount;
      currentAngle += randomCurve;
      
      currentX += Math.cos(currentAngle) * segmentLength;
      currentY += Math.sin(currentAngle) * segmentLength;
      
      pathPoints.push({ x: currentX, y: currentY });
      ctx.lineTo(currentX, currentY);
    }
    ctx.stroke();

    // Естественное убывание ветвей
    let nextBranches;
    const naturalEvolution = -15;
    const evolutionStrength = naturalEvolution / 100;
    
    if (Math.abs(evolutionStrength) < 0.01) {
      nextBranches = settings.branches;
    } else {
      const levelProgress = (maxDepth - currentDepth) / maxDepth;
      const evolutionEffect = evolutionStrength * levelProgress * 3;
      nextBranches = Math.max(1, Math.min(6, 
        Math.round(settings.branches + evolutionEffect)
      ));
    }

    // Дочерние ветви
    const newLength = length * settings.scale;
    const angleSpread = (settings.angle * Math.PI) / 180;

    // Толщина по принципу да Винчи
    const childThickness = nextBranches > 1 ? thickness / Math.sqrt(nextBranches) : thickness * 0.7;

    for (let i = 0; i < nextBranches; i++) {
      let branchAngle;
      let branchX, branchY;
      
      if (nextBranches === 1) {
        branchAngle = currentAngle;
        branchX = currentX;
        branchY = currentY;
      } else {
        // Симметричное ветвление - все ветки точно от ствола
        if (!settings.distributedBranching) {
          // Классическое - все из конца ствола
          if (nextBranches === 2) {
            branchAngle = currentAngle + (i === 0 ? -angleSpread/2 : angleSpread/2);
            branchX = currentX;
            branchY = currentY;
          } else {
            const step = angleSpread / (nextBranches - 1);
            branchAngle = currentAngle - angleSpread/2 + step * i;
            branchX = currentX;
            branchY = currentY;
          }
        } else {
          // Ветвление по стволу - используем точки вдоль ствола
          if (nextBranches === 2) {
            branchAngle = currentAngle + (i === 0 ? -angleSpread/2 : angleSpread/2);
            if (i === 0) {
              // Первая ветвь из конца
              branchX = currentX;
              branchY = currentY;
            } else {
              // Вторая ветвь из точки на 60% пути ствола
              const pointIndex = Math.floor(pathPoints.length * 0.6);
              const point = pathPoints[pointIndex];
              branchX = point.x;
              branchY = point.y;
            }
          } else {
            // Для 3+ ветвей равномерно распределяем по длине ствола
            const step = angleSpread / (nextBranches - 1);
            branchAngle = currentAngle - angleSpread/2 + step * i;
            
            if (i === 0) {
              // Первая ветвь из конца
              branchX = currentX;
              branchY = currentY;
            } else {
              // Остальные из точек по стволу
              const progress = 0.3 + (i - 1) * 0.5 / (nextBranches - 2);
              const pointIndex = Math.floor(pathPoints.length * progress);
              const point = pathPoints[Math.min(pointIndex, pathPoints.length - 1)];
              branchX = point.x;
              branchY = point.y;
            }
          }
        }
      }

      drawBranch(
        ctx,
        branchX,
        branchY,
        branchAngle,
        newLength,
        childThickness,
        currentDepth - 1,
        maxDepth
      );
    }
  };

  const drawTree = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Если canvas пустой, не рисуем
    if (width === 0 || height === 0) return;

    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f1419');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Определяем позицию дерева
    const startX = width / 2;
    let startY;
    
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      startY = height; // Точно от низа на мобильной
    } else {
      // Десктопная версия - видимое дерево
      startY = height * 0.85; // 85% высоты экрана
    }
    
    const initialAngle = -Math.PI / 2; // Растет вверх
    const initialLength = Math.min(width, height) * 0.35;
    const initialThickness = 12;

    drawBranch(
      ctx,
      startX,
      startY,
      initialAngle,
      initialLength,
      initialThickness,
      settings.depth,
      settings.depth
    );
  }, [settings]);

  const randomizeTree = () => {
    setSettings({
      depth: Math.floor(Math.random() * 5) + 5,
      branches: Math.floor(Math.random() * 4) + 2,
      angle: Math.floor(Math.random() * 100) + 20,
      scale: Math.random() * 0.4 + 0.5,
      curvature: Math.random() * 0.8,
      distributedBranching: Math.random() > 0.5,
      colorPalette: Math.floor(Math.random() * 4),
      leaves: Math.random() > 0.3
    });
  };

  const HelpButton = ({ helpKey }) => (
    <button
      className="ml-2 w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full flex items-center justify-center"
      onClick={() => setActiveHelp(activeHelp === helpKey ? null : helpKey)}
    >
      ?
    </button>
  );

  const openNatureHelp = () => {
    setShowNatureHelp(true);
  };

  const closeNatureHelp = () => {
    setShowNatureHelp(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Убедимся что canvas занимает всё пространство
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        drawTree(); // Перерисовываем при изменении размера
      }
    };

    // Небольшая задержка для корректной инициализации
    setTimeout(resizeCanvas, 100);
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawTree]);

  useEffect(() => {
    drawTree();
  }, [drawTree]);

  // Принудительная перерисовка для десктопа
  useEffect(() => {
    const timer = setTimeout(() => {
      drawTree();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen w-full">
        {/* Canvas */}
        <div className="flex-1 relative bg-black min-w-0">
          <canvas ref={canvasRef} className="w-full h-full block" />
          
          <div className="absolute top-6 left-6 z-10">
            <h1 className="text-5xl font-thin text-white/95 tracking-wide">
              TreeGen
            </h1>
          </div>

          {/* Nature Help Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={openNatureHelp}
              className="w-12 h-12 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all text-lg font-medium"
              title="Справка о деревьях в природе"
            >
              ?
            </button>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-80 bg-gray-900/98 border-l border-gray-700 p-4 overflow-y-auto flex-shrink-0">
          <div className="space-y-5 min-w-0">
            
            {/* Color Palette */}
            <div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {colorPalettes.map((palette, index) => (
                  <button
                    key={index}
                    onClick={() => setSettings(prev => ({ ...prev, colorPalette: index }))}
                    className={`w-full h-10 rounded-lg border-2 transition-all ${
                      settings.colorPalette === index 
                        ? 'border-white shadow-lg' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${palette.trunk.hue}, ${palette.trunk.sat}%, 50%), hsl(${palette.leaves.hue}, ${palette.leaves.sat}%, 70%))`
                    }}
                    title={palette.name}
                  />
                ))}
              </div>
            </div>
            
            {/* Depth */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-white">
                  Глубина: {settings.depth}
                </label>
                <HelpButton helpKey="depth" />
              </div>
              <input
                type="range" 
                min="3" 
                max="10" 
                value={settings.depth}
                onChange={(e) => setSettings(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg slider"
              />
              {activeHelp === 'depth' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.depth.content}
                </div>
              )}
            </div>

            {/* Branches */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-white">
                  Начальные ветви: {settings.branches}
                </label>
                <HelpButton helpKey="branches" />
              </div>
              <input
                type="range" 
                min="1" 
                max="6" 
                value={settings.branches}
                onChange={(e) => setSettings(prev => ({ ...prev, branches: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg slider"
              />
              {activeHelp === 'branches' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.branches.content}
                </div>
              )}
            </div>

            {/* Distributed Branching Toggle */}
            <div>
              <div className="flex items-center mb-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.distributedBranching}
                    onChange={(e) => setSettings(prev => ({ ...prev, distributedBranching: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-white">
                    {settings.distributedBranching ? "Ветви по стволу" : "Классическое ветвление"}
                  </span>
                </label>
                <HelpButton helpKey="branching" />
              </div>
              {activeHelp === 'branching' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.branching.content}
                </div>
              )}
            </div>

            {/* Leaves Toggle */}
            <div>
              <div className="flex items-center mb-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.leaves}
                    onChange={(e) => setSettings(prev => ({ ...prev, leaves: e.target.checked }))}
                    className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-white">
                    Листья
                  </span>
                </label>
                <HelpButton helpKey="leaves" />
              </div>
              {activeHelp === 'leaves' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.leaves.content}
                </div>
              )}
            </div>

            {/* Angle */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-white">
                  Угол: {settings.angle}°
                </label>
                <HelpButton helpKey="angle" />
              </div>
              <input
                type="range" 
                min="10" 
                max="150" 
                value={settings.angle}
                onChange={(e) => setSettings(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg slider"
              />
              {activeHelp === 'angle' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.angle.content}
                </div>
              )}
            </div>

            {/* Scale */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-white">
                  Масштаб: {settings.scale.toFixed(2)}
                </label>
                <HelpButton helpKey="scale" />
              </div>
              <input
                type="range" 
                min="0.4" 
                max="0.95" 
                step="0.01"
                value={settings.scale}
                onChange={(e) => setSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg slider"
              />
              {activeHelp === 'scale' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.scale.content}
                </div>
              )}
            </div>

            {/* Curvature */}
            <div>
              <div className="flex items-center mb-2">
                <label className="block text-sm font-medium text-white">
                  Изгибы: {settings.curvature.toFixed(2)}
                </label>
                <HelpButton helpKey="curvature" />
              </div>
              <input
                type="range" 
                min="0" 
                max="1" 
                step="0.01"
                value={settings.curvature}
                onChange={(e) => setSettings(prev => ({ ...prev, curvature: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-700 rounded-lg slider"
              />
              {activeHelp === 'curvature' && (
                <div className="mt-2 p-3 bg-blue-900/50 rounded text-xs text-blue-200">
                  {natureHelp.curvature.content}
                </div>
              )}
            </div>

            {/* Random Button */}
            <button
              onClick={randomizeTree}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-all text-sm mt-8"
            >
              Случайное дерево
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden h-screen flex flex-col">
        {/* Canvas */}
        <div className="flex-1 relative">
          <canvas ref={canvasRef} className="w-full h-full" />
          
          <div className="absolute top-4 left-4 z-10">
            <h1 className="text-3xl font-thin text-white/95 tracking-wide">
              TreeGen
            </h1>
          </div>

          {/* Nature Help Button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={openNatureHelp}
              className="w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white transition-all text-base font-medium"
              title="Справка о природе"
            >
              ?
            </button>
          </div>
        </div>

        {/* Mobile Control Panel - точно 240px высоты */}
        <div className="bg-gray-900/98 border-t border-gray-700 p-3" style={{height: '240px'}}>
          <div className="space-y-3 h-full overflow-y-auto">
            
            {/* Color Palette */}
            <div>
              <div className="grid grid-cols-4 gap-1 mb-3">
                {colorPalettes.map((palette, index) => (
                  <button
                    key={index}
                    onClick={() => setSettings(prev => ({ ...prev, colorPalette: index }))}
                    className={`w-full h-8 rounded border-2 transition-all ${
                      settings.colorPalette === index 
                        ? 'border-white' 
                        : 'border-gray-600'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, hsl(${palette.trunk.hue}, ${palette.trunk.sat}%, 50%), hsl(${palette.leaves.hue}, ${palette.leaves.sat}%, 70%))`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Controls Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-white mb-1">Глубина: {settings.depth}</div>
                <input
                  type="range" 
                  min="3" 
                  max="10" 
                  value={settings.depth}
                  onChange={(e) => setSettings(prev => ({ ...prev, depth: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg slider-mobile"
                />
              </div>
              <div>
                <div className="text-xs text-white mb-1">Ветви: {settings.branches}</div>
                <input
                  type="range" 
                  min="1" 
                  max="6" 
                  value={settings.branches}
                  onChange={(e) => setSettings(prev => ({ ...prev, branches: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg slider-mobile"
                />
              </div>
              <div>
                <div className="text-xs text-white mb-1">Угол: {settings.angle}°</div>
                <input
                  type="range" 
                  min="10" 
                  max="150" 
                  value={settings.angle}
                  onChange={(e) => setSettings(prev => ({ ...prev, angle: parseInt(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg slider-mobile"
                />
              </div>
              <div>
                <div className="text-xs text-white mb-1">Масштаб: {settings.scale.toFixed(2)}</div>
                <input
                  type="range" 
                  min="0.4" 
                  max="0.95" 
                  step="0.01"
                  value={settings.scale}
                  onChange={(e) => setSettings(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg slider-mobile"
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.distributedBranching}
                  onChange={(e) => setSettings(prev => ({ ...prev, distributedBranching: e.target.checked }))}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-white">По стволу</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={settings.leaves}
                  onChange={(e) => setSettings(prev => ({ ...prev, leaves: e.target.checked }))}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-white">Листья</span>
              </label>
              
              <div className="flex-1">
                <div className="text-xs text-white mb-1">Изгибы: {settings.curvature.toFixed(2)}</div>
                <input
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01"
                  value={settings.curvature}
                  onChange={(e) => setSettings(prev => ({ ...prev, curvature: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-700 rounded-lg slider-mobile"
                />
              </div>
              
              <button
                onClick={randomizeTree}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-xs"
              >
                Случайное
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Nature Help Modal */}
      {showNatureHelp && (
        <div className="fixed inset-0 z-50">
          {/* Background overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-70"
            onClick={closeNatureHelp}
          ></div>
          
          {/* Modal content */}
          <div className="relative z-10 flex items-center justify-center min-h-full p-4">
            <div 
              className="bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with just close button */}
              <div className="flex justify-end items-center p-4 border-b border-gray-700 bg-gray-800 rounded-t-xl">
                <button
                  onClick={closeNatureHelp}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-all"
                  title="Закрыть"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6" style={{maxHeight: 'calc(90vh - 80px)'}}>
                <div className="space-y-8">
                  {Object.entries(natureHelp).map(([key, content]) => (
                    <div key={key} className="pb-6 border-b border-gray-700 last:border-b-0 last:pb-0">
                      <h3 className="font-semibold text-white mb-3 text-xl flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                        {content.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-base pl-5">
                        {content.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .slider {
          appearance: none;
          cursor: pointer;
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .slider-mobile {
          appearance: none;
          cursor: pointer;
        }
        
        .slider-mobile::-webkit-slider-thumb {
          appearance: none;
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
        
        .slider-mobile::-moz-range-thumb {
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        }
      `}</style>
    </div>
  );
};

export default TreeGenerator;