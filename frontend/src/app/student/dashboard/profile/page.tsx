'use client';

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface Course {
  id: string;
  name: string;
  term: string;
  department: string;
  number: number;
}

interface LinkField {
  title: string;
  url: string;
}

export default function StudentProfilePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [links, setLinks] = useState<LinkField[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;
      setName(data.name);
      setEmail(data.email);
      setBio(data.biography || '');
      setLinks(Array.isArray(data.links) ? data.links : JSON.parse(data.links || '[]'));
      setCourses(data.courses);
      setProfilePic(data.profile_picture || '');
    } catch (err) {
      console.error('❌ Failed to fetch profile:', err);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('biography', bio);
      formData.append('links', JSON.stringify(links));
      if (selectedFile) {
        formData.append('profile_picture', selectedFile);
      }

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/student/profile/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setIsEditing(false);
      fetchProfile();
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/student/profile/remove-photo`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfilePic('');
      setSelectedFile(null);
    } catch (err) {
      console.error('❌ Failed to remove photo:', err);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLinkChange = (index: number, field: keyof LinkField, value: string) => {
    const updated = [...links];
    updated[index][field] = value;
    setLinks(updated);
  };

  const addLinkField = () => {
    setLinks([...links, { title: '', url: '' }]);
  };
  const removeLinkField = (index: number) => {
    const updated = [...links];
    updated.splice(index, 1);
    setLinks(updated);
  };
  

  const imageSrc =
    profilePic && profilePic.startsWith('/uploads')
      ? `${process.env.NEXT_PUBLIC_API_URL}${profilePic}`
      : profilePic || '/placeholder.png';

  return (
    <div className="flex justify-center w-full py-6">
      <div className="w-[900px] mx-auto">
        <div className="grid grid-cols-[1fr_280px] gap-x-2 items-start">
          {/* Left column - Main content */}
          <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-0.5">{name}</h1>
              <p className="text-gray-500 text-sm">Student</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Contact</h2>
              <p className="text-gray-500">{email}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Biography</h2>
              {isEditing ? (
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Write your biography here..."
                  className="mt-2"
                />
              ) : (
                <p className="text-gray-500">{bio || 'Not provided'}</p>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Links</h2>
              {isEditing ? (
                <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Title"
                      value={link.title}
                      onChange={(e) => handleLinkChange(index, 'title', e.target.value)}
                      className="w-full"
                    />
                    <Input
                      placeholder="URL"
                      value={link.url}
                      onChange={(e) => handleLinkChange(index, 'url', e.target.value)}
                      className="w-full"
                    />
                    <button
                      onClick={() => removeLinkField(index)}
                      className="text-red-600 text-sm font-semibold hover:underline px-2"
                      title="Remove"
                    >
                      ❌
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addLinkField}
                  className="cursor-pointer text-red-600 border-red-600 hover:bg-red-50 mt-2"
                >
                  {links.length === 0 ? 'Add Link' : 'Add another link'}
                </Button>
              </div>
              
              ) : (
                <div className="text-red-600">
                  {links.map((link, index) => (
                    link.title && link.url ? (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline block"
                      >
                        <FaExternalLinkAlt className="inline mr-2" />
                        {link.title}
                      </a>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-1">Enrolled Courses</h2>
              {courses.length === 0 ? (
                <p className="text-sm italic text-gray-500">Not enrolled in any courses yet.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-0.5 text-gray-500">
                  {courses.map((course) => (
                    <li key={course.id}>{`${course.term} • ${course.department}-${course.number} — ${course.name}`}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Edit Profile Button */}
            <div className="pt-4">
              {isEditing ? (
                <div className="flex gap-4">
                  <Button variant="outline" className="cursor-pointer" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button className="cursor-pointer" onClick={handleSave}>Save Profile</Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="cursor-pointer border border-red-600 text-red-600 hover:bg-red-50 px-6">
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Right column - Profile Image */}
          <div className="w-56 flex flex-col items-center">
            <img
              src={imageSrc}
              alt="Profile"
              className="w-56 h-56 rounded-full object-cover border border-gray-200"
            />
            {isEditing && (
              <div className="mt-2 flex flex-col items-center gap-1">
                <label htmlFor="fileUpload" className="text-blue-600 hover:underline cursor-pointer">
                  Choose Photo
                </label>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />
                {profilePic && (
                  <button
                    onClick={handleRemovePhoto}
                    className="text-red-600 hover:underline cursor-pointer"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
