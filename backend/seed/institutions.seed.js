const institutions = [
  {
    name: 'Malla Reddy Deemed University',
    code: 'MRDU',
    address: {
      street: 'Maisammaguda',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500100',
      country: 'India',
    },
    naacGrade: 'A',
    nirfRank: 85,
    departments: [
      { name: 'Computer Science & Engineering', code: 'CSE', hodName: 'Dr. Rajesh Kumar' },
      { name: 'Information Technology', code: 'IT', hodName: 'Dr. Priya Sharma' },
      { name: 'Electronics & Communication', code: 'ECE', hodName: 'Dr. Venkat Rao' },
      { name: 'Mechanical Engineering', code: 'ME', hodName: 'Dr. Suresh Babu' },
      { name: 'Artificial Intelligence & ML', code: 'AIML', hodName: 'Dr. Kavitha Devi' },
    ],
    website: 'https://mrdu.edu.in',
    isActive: true,
  },
];

export default institutions;
