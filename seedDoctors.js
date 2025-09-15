const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://gandhirajj2023aiml_db_user:x2tO6OG5gWhyt9vp@cluster0.fpevdso.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Sample doctors data with user information
const sampleDoctors = [
  {
    user: {
      name: "Dr. John Doe",
      email: "john.doe@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0101",
      address: "123 Medical Center, Boston, MA"
    },
    name: "Dr. John Doe",
    specialization: "Cardiology",
    experience: 12,
    fees: 3000,
    timings: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
    averageRating: 4.7,
    numberOfReviews: 25,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Cardiology",
        college: "Harvard Medical School",
        year: 2010
      },
      {
        degree: "MBBS",
        college: "Johns Hopkins University",
        year: 2008
      }
    ]
  },
  {
    user: {
      name: "Dr. Sarah Wilson",
      email: "sarah.wilson@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0102",
      address: "456 Neurology Center, Stanford, CA"
    },
    name: "Dr. Sarah Wilson",
    specialization: "Neurology",
    experience: 15,
    fees: 3000,
    timings: ["10:00 AM - 01:00 PM", "03:00 PM - 06:00 PM"],
    averageRating: 4.8,
    numberOfReviews: 32,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Neurology",
        college: "Stanford Medical School",
        year: 2009
      },
      {
        degree: "MBBS",
        college: "UCLA School of Medicine",
        year: 2007
      }
    ]
  },
  {
    user: {
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0103",
      address: "789 Orthopedic Center, Rochester, MN"
    },
    name: "Dr. Michael Chen",
    specialization: "Orthopedics",
    experience: 10,
    fees: 3000,
    timings: ["08:00 AM - 11:00 AM", "01:00 PM - 04:00 PM"],
    averageRating: 4.6,
    numberOfReviews: 28,
    isAvailable: true,
    qualifications: [
      {
        degree: "MS in Orthopedics",
        college: "Mayo Clinic School of Medicine",
        year: 2012
      },
      {
        degree: "MBBS",
        college: "Duke University School of Medicine",
        year: 2010
      }
    ]
  },
  {
    user: {
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0104",
      address: "321 Dermatology Center, New Haven, CT"
    },
    name: "Dr. Emily Rodriguez",
    specialization: "Dermatology",
    experience: 8,
    fees: 3000,
    timings: ["09:30 AM - 12:30 PM", "02:30 PM - 05:30 PM"],
    averageRating: 4.9,
    numberOfReviews: 45,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Dermatology",
        college: "Yale School of Medicine",
        year: 2014
      },
      {
        degree: "MBBS",
        college: "Columbia University College of Physicians",
        year: 2012
      }
    ]
  },
  {
    user: {
      name: "Dr. David Thompson",
      email: "david.thompson@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0105",
      address: "654 Children's Hospital, Boston, MA"
    },
    name: "Dr. David Thompson",
    specialization: "Pediatrics",
    experience: 14,
    fees: 2000,
    timings: ["08:30 AM - 11:30 AM", "01:30 PM - 04:30 PM"],
    averageRating: 4.8,
    numberOfReviews: 38,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Pediatrics",
        college: "Boston Children's Hospital",
        year: 2010
      },
      {
        degree: "MBBS",
        college: "University of Pennsylvania School of Medicine",
        year: 2008
      }
    ]
  },
  {
    user: {
      name: "Dr. Lisa Anderson",
      email: "lisa.anderson@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0106",
      address: "987 General Medicine Center, Chicago, IL"
    },
    name: "Dr. Lisa Anderson",
    specialization: "General Physician",
    experience: 16,
    fees: 2000,
    timings: ["09:00 AM - 12:00 PM", "02:00 PM - 05:00 PM"],
    averageRating: 4.5,
    numberOfReviews: 52,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Internal Medicine",
        college: "Northwestern University Feinberg School of Medicine",
        year: 2008
      },
      {
        degree: "MBBS",
        college: "University of Chicago Pritzker School of Medicine",
        year: 2006
      }
    ]
  },
  {
    user: {
      name: "Dr. Robert Kim",
      email: "robert.kim@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0107",
      address: "147 Dental Center, San Francisco, CA"
    },
    name: "Dr. Robert Kim",
    specialization: "Dentistry",
    experience: 11,
    fees: 3000,
    timings: ["08:00 AM - 11:00 AM", "01:00 PM - 04:00 PM"],
    averageRating: 4.7,
    numberOfReviews: 29,
    isAvailable: true,
    qualifications: [
      {
        degree: "DDS (Doctor of Dental Surgery)",
        college: "University of California San Francisco",
        year: 2011
      },
      {
        degree: "BDS",
        college: "University of Southern California",
        year: 2009
      }
    ]
  },
  {
    user: {
      name: "Dr. Jennifer Martinez",
      email: "jennifer.martinez@hospital.com",
      password: "password123",
      role: "doctor",
      phone: "+1-555-0108",
      address: "258 Cancer Center, Houston, TX"
    },
    name: "Dr. Jennifer Martinez",
    specialization: "Oncology",
    experience: 13,
    fees: 4000,
    timings: ["10:00 AM - 01:00 PM", "03:00 PM - 06:00 PM"],
    averageRating: 4.9,
    numberOfReviews: 41,
    isAvailable: true,
    qualifications: [
      {
        degree: "MD in Oncology",
        college: "MD Anderson Cancer Center",
        year: 2010
      },
      {
        degree: "MBBS",
        college: "Baylor College of Medicine",
        year: 2008
      }
    ]
  }
];

const seedDoctors = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing doctors and users (optional - remove this if you want to keep existing data)
    await Doctor.deleteMany({});
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors and doctor users');

    const createdDoctors = [];

    // Create users and doctors
    for (const doctorData of sampleDoctors) {
      // Create user first
      const user = await User.create(doctorData.user);
      console.log(`Created user: ${user.name} (${user.email})`);

      // Create doctor with user reference
      const doctorInfo = { ...doctorData };
      delete doctorInfo.user; // Remove user data from doctor object
      doctorInfo.user = user._id; // Set user reference

      const doctor = await Doctor.create(doctorInfo);
      createdDoctors.push(doctor);
      console.log(`Created doctor: ${doctor.name} - ${doctor.specialization}`);
    }

    console.log(`\nSuccessfully added ${createdDoctors.length} doctors to the database`);

    // Display the added doctors
    console.log('\nAdded doctors:');
    createdDoctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.name} - ${doctor.specialization} (${doctor.experience} years experience, ₹${doctor.fees} consultation fee)`);
    });

    console.log('\nSeed script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDoctors();
