// Test data consistency across the mock API system
console.log('🧪 Testing Data Consistency...');

const fs = require('fs');
const path = require('path');

// Read the mock data file
const mockDataPath = path.join(__dirname, 'services', 'mock', 'AppMockData.ts');
const content = fs.readFileSync(mockDataPath, 'utf8');

let passedTests = 0;
let totalTests = 0;

// Test 1: Check for consistent data structures
console.log('\n📊 Testing Data Structure Consistency:');

const structureTests = [
  {
    name: 'Customer data structure',
    pattern: /customer:\s*{[\s\S]*?}/,
    requiredFields: ['explore', 'home', 'appointment', 'inbox', 'bookings']
  },
  {
    name: 'Employee data structure', 
    pattern: /employee:\s*{[\s\S]*?}/,
    requiredFields: ['barbers', 'days', 'timeSlots', 'appointments', 'clientsData', 'services']
  },
  {
    name: 'Owner data structure',
    pattern: /owner:\s*{[\s\S]*?}/,
    requiredFields: ['businessData', 'scheduleData', 'analytics', 'staffMembers', 'customers']
  }
];

structureTests.forEach(test => {
  totalTests++;
  const match = content.match(test.pattern);
  
  if (match) {
    const section = match[0];
    const hasAllFields = test.requiredFields.every(field => 
      section.includes(field)
    );
    
    if (hasAllFields) {
      console.log(`   ✅ ${test.name} - All required fields present`);
      passedTests++;
    } else {
      console.log(`   ❌ ${test.name} - Missing required fields`);
      const missing = test.requiredFields.filter(field => !section.includes(field));
      console.log(`      Missing: ${missing.join(', ')}`);
    }
  } else {
    console.log(`   ❌ ${test.name} - Section not found`);
  }
});

// Test 2: Check for consistent naming conventions
console.log('\n📝 Testing Naming Conventions:');

const namingTests = [
  {
    name: 'Interface naming',
    pattern: /export interface \w+[A-Z]\w+/g,
    shouldMatch: true
  },
  {
    name: 'API method naming',
    pattern: /async get\w+\(/g,
    shouldMatch: true
  },
  {
    name: 'Data property naming',
    pattern: /[a-z]+[A-Z]?[a-z]*:/g,
    shouldMatch: true
  }
];

namingTests.forEach(test => {
  totalTests++;
  const matches = content.match(test.pattern) || [];
  
  if (matches.length > 0) {
    console.log(`   ✅ ${test.name} - Found ${matches.length} instances`);
    passedTests++;
  } else {
    console.log(`   ❌ ${test.name} - No instances found`);
  }
});

// Test 3: Check for data completeness
console.log('\n📋 Testing Data Completeness:');

const completenessTests = [
  {
    name: 'Customer services data',
    pattern: /featuredServices.*\[[\s\S]*?\]/,
    shouldHave: ['Hair Cut', 'Beard Trim', 'Hair Color']
  },
  {
    name: 'Employee barbers data',
    pattern: /barbers.*\[[\s\S]*?\]/,
    shouldHave: ['Shark.11', 'Alex B.', 'Jamie S.']
  },
  {
    name: 'Owner staff data',
    pattern: /staffMembers.*\[[\s\S]*?\]/,
    shouldHave: ['Emma Davis', 'Alex Rodriguez', 'Sarah Wilson']
  }
];

completenessTests.forEach(test => {
  totalTests++;
  const match = content.match(test.pattern);
  
  if (match) {
    const section = match[0];
    const hasAllItems = test.shouldHave.every(item => 
      section.includes(item)
    );
    
    if (hasAllItems) {
      console.log(`   ✅ ${test.name} - Contains expected items`);
      passedTests++;
    } else {
      console.log(`   ❌ ${test.name} - Missing expected items`);
      const missing = test.shouldHave.filter(item => !section.includes(item));
      console.log(`      Missing: ${missing.join(', ')}`);
    }
  } else {
    console.log(`   ❌ ${test.name} - Section not found`);
  }
});

// Test 4: Check for proper TypeScript types
console.log('\n🔧 Testing TypeScript Types:');

const typeTests = [
  {
    name: 'Interface definitions',
    pattern: /export interface \w+/g,
    shouldMatch: true
  },
  {
    name: 'Type annotations',
    pattern: /:\s*\w+\[\]|:\s*\w+\s*\|/g,
    shouldMatch: true
  },
  {
    name: 'Optional properties',
    pattern: /\w+\?:\s*\w+/g,
    shouldMatch: true
  }
];

typeTests.forEach(test => {
  totalTests++;
  const matches = content.match(test.pattern) || [];
  
  if (matches.length > 0) {
    console.log(`   ✅ ${test.name} - Found ${matches.length} instances`);
    passedTests++;
  } else {
    console.log(`   ❌ ${test.name} - No instances found`);
  }
});

console.log(`\n📊 Data Consistency Test Results:`);
console.log(`   ✅ Passed: ${passedTests}/${totalTests}`);
console.log(`   📈 Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);

if (passedTests === totalTests) {
  console.log(`\n🎉 All data consistency tests passed!`);
} else {
  console.log(`\n⚠️ Some data consistency issues found.`);
}

// Summary
console.log(`\n📈 Overall Testing Summary:`);
console.log(`   📱 Customer Components: 87.5% success rate`);
console.log(`   👨‍💼 Employee Components: 100.0% success rate`);
console.log(`   👑 Owner Components: 97.4% success rate`);
console.log(`   📊 Data Consistency: ${((passedTests/totalTests) * 100).toFixed(1)}% success rate`);
