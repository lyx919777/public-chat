/**
 * 测试 preprocessMath 是否能正确处理缺失开头 $$ 的情况。
 */
function preprocessMath(content) {
  // 0) 修复缺少开头的 $$
  content = content.replace(
    /^(?!\$\$)(?:[ \t]*[=:]\s+)?(\\[a-zA-Z]+[\s\S]*?)\}\s*\$\$([ \t]|$)/gm,
    (_, latex) => `$$${latex}}$$\n\n`
  );

  // 1) $...$ → \(...\)
  content = content.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_, inner) => {
    const trimmed = inner.trim();
    if (/^[\d.,\s]*$/.test(trimmed)) return `$${trimmed}$`;
    return `\\(${trimmed}\\)`;
  });

  // 1) \(...\) → $...$
  content = content.replace(/\\\(([\s\S]*?)\\\)/g, (_, inner) => {
    return `$${inner.trim()}$`;
  });

  // 2) \[...\] → \n\n$$...$$\n\n
  content = content.replace(/\\\[([\s\S]*?)\\\]/g, (_, inner) => {
    return `\n\n$$${inner.trim()}$$\n\n`;
  });

  // 3) 裸的 [ LaTeX ]
  content = content.replace(/(?<!\\)\[([^\[\]]+)\](?!\\)/g, (match, inner) => {
    if (/\\[a-zA-Z]+|[\\^{}_]/.test(inner)) {
      return `\n\n$$${inner.trim()}$$\n\n`;
    }
    return match;
  });

  // 4) 将行内混在文字中的 $$...$$ 移到独立一行
  content = content.replace(
    /([^\n])\s*\$\$([\s\S]*?)\$\$\s*/g,
    (_, before, inner) => {
      if (before === '\n' || before === '') return _;
      return `${before}\n\n$$${inner.trim()}$$\n\n`;
    }
  );

  return content;
}

// ========== 测试用例 ==========

const input = `逐项积分从 0 到 1：

= \\sum_{n=0}^\\infty \\frac{(-1)^n}{(2n+1)(2n+1)!}$$ 这个级数收敛较快，我们可以计算前几项来近似： 计算到 $n=5$： $$\\begin{aligned} &\\frac{1}{1 \\cdot 1!} = 1 \\\\ &-\\frac{1}{3 \\cdot 3!} = -\\frac{1}{3 \\cdot 6} = -\\frac{1}{18} \\approx -0.0555556 \\\\ &+\\frac{1}{5 \\cdot 5!} = \\frac{1}{5 \\cdot 120} = \\frac{1}{600} = 0.0016667 \\\\ &-\\frac{1}{7 \\cdot 7!} = -\\frac{1}{7 \\cdot 5040} \\approx -0.0000283 \\\\ &+\\frac{1}{9 \\cdot 9!} = \\frac{1}{9 \\cdot 362880} \\approx 3.05 \\times 10^{-7} \\\\ &-\\frac{1}{11 \\cdot 11!} \\approx -1.7 \\times 10^{-9} \\end{aligned}$$ 累加： $$I \\approx 1 - 0.0555556 + 0.0016667 - 0.0000283 + 3.05 \\times 10^{-7} - 1.7 \\times 10^{-9} \\approx 0.9460831$$`;

console.log('=== INPUT ===');
console.log(input);
console.log('\n=== OUTPUT ===');
const output = preprocessMath(input);
console.log(output);

// 验证关键修复
const fix1 = output.includes('$$\\sum_{n=0}^\\infty \\frac{(-1)^n}{(2n+1)(2n+1)!}$$');
console.log('\n=== 验证 ===');
console.log('缺失 $$ 已补上:', fix1 ? '✅ 通过' : '❌ 失败');

// 验证 step 4 没有破坏内容
const dollarCount = (output.match(/\$\$/g) || []).length;
console.log('$$ 对数为偶数:', dollarCount % 2 === 0 ? `✅ 通过 (${dollarCount}个$$)` : `❌ 失败 (${dollarCount}个$$)`);

// 验证没有裸的 $n=5$ 被误吃
const hasN5 = output.includes('$n=5$');
console.log('$n=5$ 保留完整:', hasN5 ? '✅ 通过' : '⚠️ 可能被吞并');
