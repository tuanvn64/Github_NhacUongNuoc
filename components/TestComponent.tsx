import React from 'react';

const TestComponent: React.FC = () => {
  // Code smell: Unused variable
  const unusedVariable = 'This is never used';

  // Bug: Potential null pointer
  const dangerousFunction = (input: string | null) => {
    return input.toUpperCase(); // Will crash if input is null
  };

  // Code duplication
  const duplicateCode1 = () => {
    console.log('This is duplicate code');
    console.log('Line 2');
    console.log('Line 3');
  };

  const duplicateCode2 = () => {
    console.log('This is duplicate code');
    console.log('Line 2');
    console.log('Line 3');
  };

  // Security issue: Hardcoded password
  const password = 'admin123';

  // Cognitive complexity: Too complex function
  const complexFunction = (a: number, b: number, c: number, d: number) => {
    if (a > 0) {
      if (b > 0) {
        if (c > 0) {
          if (d > 0) {
            return a + b + c + d;
          } else {
            return a + b + c;
          }
        } else {
          return a + b;
        }
      } else {
        return a;
      }
    } else {
      return 0;
    }
  };

  return (
    <div>
      <h1>Test Component with Quality Issues</h1>
      <p>This component contains various code quality issues for SonarQube testing</p>
    </div>
  );
};

export default TestComponent;