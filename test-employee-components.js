// Test employee-side converted components
console.log('🧪 Testing Employee Components...');

const fs = require('fs');
const path = require('path');

// Test employee components
const employeeComponents = [
  {
    file: 'app/(employee)/AdminHomeScreen.tsx',
    checks: [
      { name: 'API import', pattern: /import.*employeeAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /employeeAPI\.get/ },
      { name: 'Admin appointments', pattern: /getAdminAppointments/ }
    ]
  },
  {
    file: 'app/(employee)/EmployeeProfileScreen.tsx',
    checks: [
      { name: 'API import', pattern: /import.*employeeAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /employeeAPI\.get/ },
      { name: 'Reviews data', pattern: /getEmployeeReviews/ }
    ]
  },
  {
    file: 'app/(employee)/AppointmentsScreen.tsx',
    checks: [
      { name: 'API import', pattern: /import.*employeeAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /employeeAPI\.get/ }
    ]
  },
  {
    file: 'app/(employee)/ScheduleScreen.tsx',
    checks: [
      { name: 'API import', pattern: /import.*employeeAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /employeeAPI\.get/ }
    ]
  },
  {
    file: 'app/(employee)/MyServicesScreen.tsx',
    checks: [
      { name: 'API import', pattern: /import.*employeeAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /employeeAPI\.get/ }
    ]
  }
];

let passedTests = 0;
let totalTests = 0;

employeeComponents.forEach(component => {
  console.log(`\n👨‍💼 Testing ${component.file}:`);
  
  const filePath = path.join(__dirname, component.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ File not found`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  component.checks.forEach(check => {
    totalTests++;
    const hasPattern = check.pattern.test(content);
    
    if (hasPattern) {
      console.log(`   ✅ ${check.name}`);
      passedTests++;
    } else {
      console.log(`   ❌ ${check.name} (missing)`);
    }
  });
  
  // Check file size
  const lines = content.split('\n').length;
  if (lines > 50 && lines < 1000) {
    console.log(`   ✅ File size reasonable (${lines} lines)`);
    passedTests++;
  } else {
    console.log(`   ⚠️ File size unusual (${lines} lines)`);
  }
  totalTests++;
});

console.log(`\n📊 Employee Components Test Results:`);
console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log(`\n🎉 All employee components are properly converted!`);
} else {
  console.log(`\n⚠️ Some employee components need attention.`);
}
