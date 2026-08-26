const fs = require('fs');
let file = fs.readFileSync('src/utils/translations.ts', 'utf8');

file = file.replace(/heroTitlePart1: 'طعم تحبه من',/, "heroTitlePart1: 'البرجر اللي',");
file = file.replace(/heroTitlePart2: 'أول قطمة في فرانك',/, "heroTitlePart2: 'بتشتهيه.',");
file = file.replace(/heroDesc: 'اكتشف سر الطعم الأصلي مع فرانك برجر\.\.\.',/, "heroDesc: 'مكونات طازجة، برجر مليان عصارة، ونكهات قوية — متحضرة على ذوقك.',");

file = file.replace(/heroTitlePart1: 'Craving a',/, "heroTitlePart1: 'The Burger',");
file = file.replace(/heroTitlePart2: 'Real Bold Burger\?',/, "heroTitlePart2: 'You Crave.',");
file = file.replace(/heroDesc: 'Discover the secret of true taste\.\.\.',/, "heroDesc: 'Fresh ingredients, juicy burgers, and bold flavors — made your way.',");

fs.writeFileSync('src/utils/translations.ts', file);
