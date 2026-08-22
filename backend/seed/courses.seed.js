const courses = [
  {
    code: 'CS301',
    title: 'Object-Oriented Programming with Python',
    department: 'CSE',
    semester: 5,
    year: 3,
    description: 'Comprehensive course covering OOP principles using Python including classes, inheritance, polymorphism, and design patterns.',
    syllabus: {
      topics: [
        {
          name: 'Introduction to OOP',
          weight: 10,
          subtopics: ['Programming Paradigms', 'OOP vs Procedural', 'Python OOP Overview'],
          skillIds: ['python.basics', 'python.oop.classes'],
        },
        {
          name: 'Classes and Objects',
          weight: 15,
          subtopics: ['Class Definition', 'Instance Variables', 'Methods', 'Constructors', 'Destructors'],
          skillIds: ['python.oop.classes'],
        },
        {
          name: 'Inheritance',
          weight: 15,
          subtopics: ['Single Inheritance', 'Multiple Inheritance', 'Method Resolution Order', 'super()'],
          skillIds: ['python.oop.inheritance'],
        },
        {
          name: 'Polymorphism',
          weight: 15,
          subtopics: ['Method Overriding', 'Method Overloading', 'Operator Overloading', 'Duck Typing'],
          skillIds: ['python.oop.polymorphism'],
        },
        {
          name: 'Encapsulation and Abstraction',
          weight: 15,
          subtopics: ['Access Modifiers', 'Property Decorators', 'Abstract Classes', 'Interfaces'],
          skillIds: ['python.oop.encapsulation', 'python.oop.abstraction'],
        },
        {
          name: 'Exception Handling',
          weight: 10,
          subtopics: ['Try-Except', 'Custom Exceptions', 'Exception Chaining'],
          skillIds: ['python.exception_handling'],
        },
        {
          name: 'File Handling and Serialization',
          weight: 10,
          subtopics: ['File I/O', 'JSON', 'Pickle', 'CSV'],
          skillIds: ['python.file_handling'],
        },
        {
          name: 'Design Patterns',
          weight: 10,
          subtopics: ['Singleton', 'Factory', 'Observer', 'Strategy'],
          skillIds: ['domain.design_patterns'],
        },
      ],
    },
  },
  {
    code: 'CS302',
    title: 'Data Structures and Algorithms',
    department: 'CSE',
    semester: 5,
    year: 3,
    description: 'Study of fundamental data structures and algorithms with complexity analysis.',
    syllabus: {
      topics: [
        {
          name: 'Arrays and Strings',
          weight: 12,
          subtopics: ['1D Arrays', '2D Arrays', 'String Manipulation', 'Sliding Window'],
          skillIds: ['dsa.arrays'],
        },
        {
          name: 'Linked Lists',
          weight: 12,
          subtopics: ['Singly Linked', 'Doubly Linked', 'Circular', 'Applications'],
          skillIds: ['dsa.linked_lists'],
        },
        {
          name: 'Stacks and Queues',
          weight: 10,
          subtopics: ['Stack Operations', 'Queue Variants', 'Priority Queue'],
          skillIds: ['dsa.stacks_queues'],
        },
        {
          name: 'Trees',
          weight: 15,
          subtopics: ['Binary Trees', 'BST', 'AVL Trees', 'Traversals'],
          skillIds: ['dsa.trees'],
        },
        {
          name: 'Graphs',
          weight: 15,
          subtopics: ['BFS', 'DFS', 'Shortest Path', 'Minimum Spanning Tree'],
          skillIds: ['dsa.graphs'],
        },
        {
          name: 'Sorting and Searching',
          weight: 12,
          subtopics: ['QuickSort', 'MergeSort', 'Binary Search', 'Comparison'],
          skillIds: ['dsa.sorting', 'dsa.searching'],
        },
        {
          name: 'Hashing',
          weight: 10,
          subtopics: ['Hash Tables', 'Collision Resolution', 'Applications'],
          skillIds: ['dsa.hashing'],
        },
        {
          name: 'Dynamic Programming',
          weight: 14,
          subtopics: ['Memoization', 'Tabulation', 'Classic Problems'],
          skillIds: ['dsa.dynamic_programming'],
        },
      ],
    },
  },
  {
    code: 'CS303',
    title: 'Full Stack Web Development',
    department: 'CSE',
    semester: 5,
    year: 3,
    description: 'End-to-end web development covering frontend frameworks, backend APIs, and databases.',
    syllabus: {
      topics: [
        {
          name: 'HTML5 and CSS3',
          weight: 10,
          subtopics: ['Semantic HTML', 'CSS Grid', 'Flexbox', 'Responsive Design'],
          skillIds: ['html.basics', 'css.basics', 'css.flexbox', 'css.grid', 'css.responsive'],
        },
        {
          name: 'JavaScript Fundamentals',
          weight: 15,
          subtopics: ['ES6+', 'Async/Await', 'Closures', 'DOM'],
          skillIds: ['javascript.basics', 'javascript.es6', 'javascript.async', 'javascript.dom'],
        },
        {
          name: 'React.js',
          weight: 20,
          subtopics: ['Components', 'Hooks', 'State Management', 'Routing'],
          skillIds: ['react.basics', 'react.hooks', 'react.state_management', 'react.router'],
        },
        {
          name: 'Node.js and Express',
          weight: 20,
          subtopics: ['Server Setup', 'Middleware', 'REST API', 'Authentication'],
          skillIds: ['node.basics', 'node.express', 'node.middleware', 'rest.api', 'node.authentication'],
        },
        {
          name: 'MongoDB',
          weight: 15,
          subtopics: ['CRUD', 'Schema Design', 'Aggregation', 'Indexing'],
          skillIds: ['mongodb.basics', 'mongodb.schema_design', 'mongodb.aggregation'],
        },
        {
          name: 'Deployment and DevOps',
          weight: 10,
          subtopics: ['Git', 'Docker Basics', 'CI/CD', 'Cloud Hosting'],
          skillIds: ['git.basics', 'docker.basics', 'ci_cd.github_actions'],
        },
        {
          name: 'Testing',
          weight: 10,
          subtopics: ['Unit Testing', 'API Testing', 'E2E Testing'],
          skillIds: ['testing.unit', 'api.testing'],
        },
      ],
    },
  },
];

export default courses;
