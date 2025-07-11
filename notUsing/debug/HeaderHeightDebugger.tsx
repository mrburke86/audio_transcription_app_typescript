// // Temporary debugging component to measure exact header height

// import { useEffect } from 'react';

// export const HeaderHeightDebugger: React.FC = () => {
//     useEffect(() => {
//         const measureHeader = () => {
//             console.log('🔍 Starting header measurement...');

//             // Try to find header elements using specific selectors
//             let headerElement: Element | null = null;

//             // Method 1: Look for elements with minHeight style
//             const styledElements = document.querySelectorAll('[style*="minHeight"]');
//             console.log(`🔍 Found ${styledElements.length} elements with minHeight style`);

//             if (styledElements.length > 0) {
//                 headerElement = styledElements[0];
//                 console.log('✅ Using first element with minHeight style');
//             }

//             // Method 2: Look for the navigation element
//             if (!headerElement) {
//                 const navElement = document.querySelector('nav[class*="grid-cols-12"]');
//                 if (navElement && navElement.parentElement) {
//                     headerElement = navElement.parentElement;
//                     console.log('✅ Using TopNavigationBar parent element');
//                 }
//             }

//             // Method 3: Look for flex-shrink-0 with border-b
//             if (!headerElement) {
//                 const flexElements = document.querySelectorAll('.flex-shrink-0');
//                 for (let i = 0; i < flexElements.length; i++) {
//                     const el = flexElements[i];
//                     if (el.className.includes('border-b')) {
//                         headerElement = el;
//                         console.log('✅ Using flex-shrink-0 element with border-b');
//                         break;
//                     }
//                 }
//             }

//             if (!headerElement) {
//                 console.log('❌ No header element found. Looking for all elements in top area...');

//                 // Fallback: find the largest element in the top 200px
//                 const allElements = document.querySelectorAll('*');
//                 let largestElement: Element | null = null;
//                 let largestHeight = 0;

//                 for (let i = 0; i < allElements.length; i++) {
//                     const el = allElements[i];
//                     const rect = el.getBoundingClientRect();
//                     if (rect.top >= 0 && rect.top < 200 && rect.height > largestHeight && rect.height < 300) {
//                         largestElement = el;
//                         largestHeight = rect.height;
//                     }
//                 }

//                 if (largestElement) {
//                     headerElement = largestElement;
//                     console.log(`✅ Using largest element in top area: ${largestHeight}px`);
//                 }
//             }

//             if (!headerElement) {
//                 console.log('❌ Could not find any suitable header element');
//                 return;
//             }

//             // Measure the header
//             const rect = headerElement.getBoundingClientRect();
//             const computedStyle = window.getComputedStyle(headerElement);

//             console.log('');
//             console.log('🎯 === HEADER MEASUREMENTS ===');
//             console.log(`📏 Element: ${headerElement.tagName}.${headerElement.className}`);
//             console.log(`📏 Total height: ${rect.height}px`);
//             console.log(`📏 Top position: ${rect.top}px`);
//             console.log(`📏 Bottom position: ${rect.bottom}px`);
//             console.log(`📏 CSS minHeight: ${computedStyle.minHeight}`);
//             console.log(`📏 CSS height: ${computedStyle.height}`);
//             console.log(`📏 Padding: ${computedStyle.paddingTop} / ${computedStyle.paddingBottom}`);
//             console.log(`📏 Border: ${computedStyle.borderTopWidth} / ${computedStyle.borderBottomWidth}`);

//             // Find specific sub-elements
//             const nav = document.querySelector('nav[class*="grid-cols-12"]');
//             if (nav) {
//                 const navRect = nav.getBoundingClientRect();
//                 console.log(`🧭 TopNavigationBar height: ${navRect.height}px`);
//             }

//             const buttonSection = document.querySelector('[class*="border-t"]');
//             if (buttonSection) {
//                 const buttonRect = buttonSection.getBoundingClientRect();
//                 console.log(`🔘 Context button section height: ${buttonRect.height}px`);
//             }

//             // Calculate recommendations
//             const actualHeight = Math.ceil(rect.height);
//             const recommendedHeight = actualHeight + 10; // Add some buffer

//             console.log('');
//             console.log('🎯 === RECOMMENDATIONS ===');
//             console.log(`✅ Current header height: ${actualHeight}px`);
//             console.log(`✅ Recommended minHeight: ${recommendedHeight}px`);
//             console.log(`✅ Recommended main content: calc(100vh - ${recommendedHeight}px)`);
//             console.log('');
//             console.log('📝 === CODE TO UPDATE ===');
//             console.log(`style={{ minHeight: '${recommendedHeight}px' }} // Header container`);
//             console.log(`style={{ minHeight: 'calc(100vh - ${recommendedHeight}px)' }} // Main content`);
//             console.log('');

//             // Visual test helper
//             console.log('🎨 === VISUAL TEST ===');
//             console.log('Add these temporary styles to see boundaries:');
//             console.log(`Header: outline: '3px solid red'`);
//             console.log(`Main content: outline: '3px solid blue'`);
//             console.log('Red and blue should not overlap!');
//         };

//         // Multiple measurement attempts for reliability
//         const delays = [100, 500, 1000];
//         delays.forEach(delay => {
//             setTimeout(measureHeader, delay);
//         });
//     }, []);

//     return process.env.NODE_ENV === 'development' ? (
//         <div
//             style={{
//                 position: 'fixed',
//                 top: 0,
//                 left: 0,
//                 background: 'linear-gradient(45deg, #ff4500, #ff6347)',
//                 color: 'white',
//                 padding: '8px 12px',
//                 fontSize: '12px',
//                 fontWeight: 'bold',
//                 zIndex: 9999,
//                 fontFamily: 'monospace',
//                 borderRadius: '0 0 8px 0',
//                 boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
//             }}
//         >
//             📏 Header Debug Active - Check Console
//         </div>
//     ) : null;
// };
