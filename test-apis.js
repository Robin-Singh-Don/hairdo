// Simple test to verify API structure
console.log('🧪 Testing API Structure...');

// Test 1: Check if mock data file exists and has expected structure
try {
  const fs = require('fs');
  const path = require('path');
  
  // Check if AppMockData.ts exists
  const mockDataPath = path.join(__dirname, 'services', 'mock', 'AppMockData.ts');
  if (fs.existsSync(mockDataPath)) {
    console.log('✅ AppMockData.ts exists');
    
    // Read and check basic structure
    const content = fs.readFileSync(mockDataPath, 'utf8');
    
    // Check for key sections
    const checks = [
      { name: 'Customer data', pattern: /customer:\s*{/ },
      { name: 'Employee data', pattern: /employee:\s*{/ },
      { name: 'Owner data', pattern: /owner:\s*{/ },
      { name: 'Customer API exports', pattern: /export.*customerData/ },
      { name: 'Employee API exports', pattern: /export.*employeeData/ },
      { name: 'Owner API exports', pattern: /export.*ownerData/ }
    ];
    
    checks.forEach(check => {
      if (check.pattern.test(content)) {
        console.log(`✅ ${check.name} found`);
      } else {
        console.log(`❌ ${check.name} missing`);
      }
    });
    
    console.log(`📊 File size: ${(content.length / 1024).toFixed(1)} KB`);
    console.log(`📊 Lines of code: ${content.split('\n').length}`);
    
  } else {
    console.log('❌ AppMockData.ts not found');
  }
} catch (error) {
  console.log('❌ Error reading mock data:', error.message);
}

// Test 2: Check API service files
const apiFiles = [
  'services/api/customerAPI.ts',
  'services/api/employeeAPI.ts', 
  'services/api/ownerAPI.ts'
];

apiFiles.forEach(file => {
  const filePath = require('path').join(__dirname, file);
  if (require('fs').existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
    
    const content = require('fs').readFileSync(filePath, 'utf8');
    const lines = content.split('\n').length;
    console.log(`   📊 ${lines} lines`);
    
    // Check for key methods
    if (content.includes('async ')) {
      console.log(`   ✅ Contains async methods`);
    }
    if (content.includes('simulateNetworkDelay')) {
      console.log(`   ✅ Contains network simulation`);
    }
  } else {
    console.log(`❌ ${file} missing`);
  }
});

console.log('\n🎯 API Structure Test Complete!');
