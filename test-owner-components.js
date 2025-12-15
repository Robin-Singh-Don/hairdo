// Test owner-side converted components
console.log('🧪 Testing Owner Components...');

const fs = require('fs');
const path = require('path');

// Test owner components
const ownerComponents = [
  {
    file: 'app/(owner)/OwnerDashboard.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Business data', pattern: /getBusinessData/ }
    ]
  },
  {
    file: 'app/(owner)/OwnerProfileNew.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Profile posts', pattern: /getOwnerProfilePosts/ }
    ]
  },
  {
    file: 'app/(owner)/CustomerReviewsPage.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Customer reviews', pattern: /getCustomerReviews/ }
    ]
  },
  {
    file: 'app/(owner)/RevenueOverview.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Revenue trend data', pattern: /getRevenueTrendData/ }
    ]
  },
  {
    file: 'app/(owner)/ClientAppointmentAnalysis.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Client appointments', pattern: /getClientAppointments/ }
    ]
  },
  {
    file: 'app/(owner)/StaffManagement.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ },
      { name: 'Staff members', pattern: /getStaffMembers/ }
    ]
  },
  {
    file: 'app/(owner)/OwnerAppointments.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ }
    ]
  },
  {
    file: 'app/(owner)/BusinessAnalytics.tsx',
    checks: [
      { name: 'API import', pattern: /import.*ownerAPI/ },
      { name: 'Loading state', pattern: /loading.*useState/ },
      { name: 'API data loading', pattern: /ownerAPI\.get/ }
    ]
  }
];

let passedTests = 0;
let totalTests = 0;

ownerComponents.forEach(component => {
  console.log(`\n👑 Testing ${component.file}:`);
  
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
  if (lines > 50 && lines < 1500) {
    console.log(`   ✅ File size reasonable (${lines} lines)`);
    passedTests++;
  } else {
    console.log(`   ⚠️ File size unusual (${lines} lines)`);
  }
  totalTests++;
});

console.log(`\n📊 Owner Components Test Results:`);
console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log(`\n🎉 All owner components are properly converted!`);
} else {
  console.log(`\n⚠️ Some owner components need attention.`);
}
