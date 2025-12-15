// Test customer-side converted components
console.log('🧪 Testing Customer Components...');

const fs = require('fs');
const path = require('path');

// Test customer components
const customerComponents = [
  {
    file: 'app/(customer)/explore.tsx',
    checks: [
      { name: 'API import', pattern: /import.*customerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /customerAPI\.get/ },
      { name: 'No hardcoded data', pattern: /const.*=.*\[/, negative: true } // Should NOT have hardcoded arrays
    ]
  },
  {
    file: 'app/(customer)/HomeScreen.tsx', 
    checks: [
      { name: 'API import', pattern: /import.*customerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /customerAPI\.get/ },
      { name: 'No hardcoded data', pattern: /const.*=.*\[/, negative: true }
    ]
  },
  {
    file: 'app/(customer)/appointment.tsx',
    checks: [
      { name: 'API import', pattern: /import.*customerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /customerAPI\.get/ },
      { name: 'useEffect for data', pattern: /useEffect.*loadData/ }
    ]
  },
  {
    file: 'app/(customer)/my-bookings.tsx',
    checks: [
      { name: 'API import', pattern: /import.*customerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /customerAPI\.get/ },
      { name: 'Proper structure', pattern: /export default function/ }
    ]
  },
  {
    file: 'app/(customer)/inbox.tsx',
    checks: [
      { name: 'API import', pattern: /import.*customerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /customerAPI\.get/ }
    ]
  }
];

let passedTests = 0;
let totalTests = 0;

customerComponents.forEach(component => {
  console.log(`\n📱 Testing ${component.file}:`);
  
  const filePath = path.join(__dirname, component.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  component.checks.forEach(check => {
    totalTests++;
    const hasPattern = check.pattern.test(content);
    const shouldHave = !check.negative;
    
    if (hasPattern === shouldHave) {
      console.log(`   ✅ ${check.name}`);
      passedTests++;
    } else {
      console.log(`   ❌ ${check.name} ${check.negative ? '(should not have)' : '(missing)'}`);
    }
  });
  
  // Check file size (should be reasonable)
  const lines = content.split('\n').length;
  if (lines > 50 && lines < 2000) {
    console.log(`   ✅ File size reasonable (${lines} lines)`);
    passedTests++;
  } else {
    console.log(`   ⚠️ File size unusual (${lines} lines)`);
  }
  totalTests++;
});

console.log(`\n📊 Customer Components Test Results:`);
console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log(`\n🎉 All customer components are properly converted!`);
} else {
  console.log(`\n⚠️ Some customer components need attention.`);
}
