import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, Plus, X } from 'lucide-react';
import styles from './UserRegistration.module.css';
import axios from '../../services/axiosConfig';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    password: '',
    phoneNumber: '',
    email: '',
    stores: ['']
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('/api/stores');
        setStores(response.data);
      } catch (error) {
        console.error('Error fetching stores:', error);
        toast.error('Failed to fetch stores.');
      }
    };
    fetchStores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStoreChange = (index, value) => {
    const newStores = [...formData.stores];
    newStores[index] = value;
    setFormData(prev => ({ ...prev, stores: newStores }));
  };

  const getAvailableStores = (currentIndex) => {
    if (formData.role === 'analyst') {
      const selectedStores = formData.stores.filter((store, index) =>
          index !== currentIndex && store.trim() !== ''
      );
      return stores.filter(store => !selectedStores.includes(store.name));
    }
    return stores;
  };

  const addStore = () => {
    if (formData.role === 'analyst') {
      setFormData(prev => ({
        ...prev,
        stores: [...prev.stores, '']
      }));
    }
  };

  const removeStore = (index) => {
    if (formData.role === 'analyst' && formData.stores.length > 1) {
      const newStores = formData.stores.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, stores: newStores }));
    }
  };

  const generatePassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    setFormData(prev => ({ ...prev, password }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = async () => {
    const nameRegex = /^[A-Za-z]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim()) {
      toast.error("First name is required.");
      return false;
    }
    if (!nameRegex.test(formData.firstName.trim())) {
      toast.error("First name must contain only letters.");
      return false;
    }
    if (formData.lastName.trim() && !nameRegex.test(formData.lastName.trim())) {
      toast.error("Last name must contain only letters.");
      return false;
    }
    if (!formData.username.trim()) {
      toast.error("Username is required.");
      return false;
    }
    if (!formData.role) {
      toast.error("Please select a role.");
      return false;
    }
    if (formData.role === 'analyst') {
      const validStores = formData.stores.filter(store => store.trim() !== '');
      if (validStores.length < 2) {
        toast.error("Analyst role requires at least 2 stores.");
        return false;
      }
    }
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must have uppercase, lowercase, number & special character.");
      return false;
    }
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits.");
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    try {
      const checkRes = await axios.get(`/api/users/check-duplicate`, {
        params: {
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        }
      });

      if (checkRes.data.usernameExists) {
        toast.error('Username already exists.');
        return false;
      }
      if (checkRes.data.emailExists) {
        toast.error('Email already exists.');
        return false;
      }
      if (checkRes.data.phoneExists) {
        toast.error('Phone number already exists.');
        return false;
      }
    } catch (err) {
      toast.error('Error checking for duplicates.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!(await validateForm())) {
      setIsLoading(false);
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        name: formData.lastName.trim()
            ? `${formData.firstName} ${formData.lastName}`
            : formData.firstName,
        phone_number: formData.phoneNumber,
        location: formData.role === 'analyst'
            ? formData.stores.filter(store => store.trim() !== '').join(',')
            : formData.stores[0],
        role: formData.role.toUpperCase(),
        stores: formData.stores.filter(store => store.trim() !== '')
      };

      await axios.post('/api/users/register', dataToSubmit);
      toast.success(`User ${formData.username} registered successfully.`);

      setFormData({
        firstName: '',
        lastName: '',
        username: '',
        role: '',
        password: '',
        phoneNumber: '',
        email: '',
        stores: ['']
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register user.');
    } finally {
      setIsLoading(false);
    }
  };

  // return (
  //     <div className={styles.userRegistrationContainer}>
  //       <div className={styles.formWrapper}>
  //         <h2 className={styles.heading}>User Registration</h2>
  //         <form onSubmit={handleSubmit} className={styles.registrationForm}>
  //           <div className={styles.formRow}>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="firstName">First Name *</label>
  //               <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
  //             </div>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="lastName">Last Name</label>
  //               <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
  //             </div>
  //           </div>
  //
  //           <div className={styles.formRow}>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="username">Username</label>
  //               <input id="username" name="username" value={formData.username} onChange={handleChange} />
  //             </div>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="role">Role</label>
  //               <select id="role" name="role" value={formData.role} onChange={handleChange}>
  //                 <option value="">Select a role</option>
  //                 <option value="associate">Associate</option>
  //                 <option value="analyst">Analyst</option>
  //                 <option value="manager">Manager</option>
  //               </select>
  //             </div>
  //           </div>
  //
  //           <div className={styles.formRow}>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="password">Password</label>
  //               <div className={styles.passwordContainer}>
  //                 <input
  //                     id="password"
  //                     name="password"
  //                     type={showPassword ? "text" : "password"}
  //                     value={formData.password}
  //                     onChange={handleChange}
  //                 />
  //                 <button type="button" onClick={togglePasswordVisibility} className={styles.eyeButton}>
  //                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  //                 </button>
  //               </div>
  //             </div>
  //             <div className={styles.formGroup}>
  //               <label>&nbsp;</label>
  //               <button type="button" onClick={generatePassword} className={styles.generatePasswordBtn}>
  //                 <Key size={16} /> Generate password
  //               </button>
  //             </div>
  //           </div>
  //
  //           <div className={styles.formRow}>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="phoneNumber">Phone number</label>
  //               <input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
  //             </div>
  //             <div className={styles.formGroup}>
  //               <label htmlFor="email">Email</label>
  //               <input id="email" name="email" value={formData.email} onChange={handleChange} />
  //             </div>
  //           </div>
  //
  //           <div className={styles.formGroup}>
  //             <label>{formData.role === 'analyst' ? 'Stores (minimum 2)' : 'Store'}</label>
  //             {formData.role === 'analyst' ? (
  //                 formData.stores.map((store, index) => (
  //                     <div key={index} className={styles.storeRow}>
  //                       <select
  //                           name={`store-${index}`}
  //                           value={store}
  //                           onChange={(e) => handleStoreChange(index, e.target.value)}
  //                       >
  //                         <option value="">Select a store</option>
  //                         {getAvailableStores(index).map(storeOption => (
  //                             <option key={storeOption.id} value={storeOption.name}>
  //                               {storeOption.name}
  //                             </option>
  //                         ))}
  //                       </select>
  //                       <div className={styles.storeActions}>
  //                         {formData.stores.length > 1 ? (
  //                             <button type="button" onClick={() => removeStore(index)} className={styles.removeStoreBtn}>
  //                               <X size={16} />
  //                             </button>
  //                         ) : (
  //                             <span className={styles.emptyBtnSpace}></span>
  //                         )}
  //                         {index === formData.stores.length - 1 ? (
  //                             <button type="button" onClick={addStore} className={styles.addStoreBtn}>
  //                               <Plus size={16} />
  //                             </button>
  //                         ) : (
  //                             <span className={styles.emptyBtnSpace}></span>
  //                         )}
  //                       </div>
  //                     </div>
  //                 ))
  //             ) : (
  //                 <select
  //                     name="store"
  //                     value={formData.stores[0] || ''}
  //                     onChange={(e) => handleStoreChange(0, e.target.value)}
  //                 >
  //                   <option value="">Select a store</option>
  //                   {stores.map(storeOption => (
  //                       <option key={storeOption.id} value={storeOption.name}>
  //                         {storeOption.name}
  //                       </option>
  //                   ))}
  //                 </select>
  //             )}
  //           </div>
  //
  //           <div className={styles.submitContainer}>
  //             <button type="submit" className={styles.registerBtn} disabled={isLoading}>
  //               {isLoading ? 'Registering...' : 'Register User'}
  //             </button>
  //           </div>
  //         </form>
  //         <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
  //       </div>
  //     </div>
  // );

  return (
      <div className={styles.userRegistrationContainer}>
        <div className={styles.contentWrapper}>
          {/* Header Section - Outside the form box */}
          <div className={styles.pageHeader}>
            <h1 className={styles.heading}>User Registration</h1>
            {/*<p className={styles.subheading}>*/}
            {/*  Create a new user account by filling out the form below. All required fields are marked with an asterisk (*).*/}
            {/*</p>*/}
          </div>

          {/* Form Section - Inside the white box */}
          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.registrationForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">First Name *</label>
                  <input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username *</label>
                  <input id="username" name="username" value={formData.username} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="role">Role *</label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="">Select a role</option>
                    <option value="associate">Associate</option>
                    <option value="analyst">Analyst</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password *</label>
                  <div className={styles.passwordContainer}>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button type="button" onClick={togglePasswordVisibility} className={styles.eyeButton}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>&nbsp;</label>
                  <button type="button" onClick={generatePassword} className={styles.generatePasswordBtn}>
                    <Key size={16} /> Generate password
                  </button>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phoneNumber">Phone number *</label>
                  <input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
              </div>

              <div className={`${styles.formGroup} ${styles.storeSection}`}>
                <label>{formData.role === 'analyst' ? 'Stores (minimum 2) *' : 'Store *'}</label>
                {formData.role === 'analyst' ? (
                    formData.stores.map((store, index) => (
                        <div key={index} className={styles.storeRow}>
                          <select
                              name={`store-${index}`}
                              value={store}
                              onChange={(e) => handleStoreChange(index, e.target.value)}
                          >
                            <option value="">Select a store</option>
                            {getAvailableStores(index).map(storeOption => (
                                <option key={storeOption.id} value={storeOption.name}>
                                  {storeOption.name}
                                </option>
                            ))}
                          </select>
                          <div className={styles.storeActions}>
                            {formData.stores.length > 1 ? (
                                <button type="button" onClick={() => removeStore(index)} className={styles.removeStoreBtn}>
                                  <X size={16} />
                                </button>
                            ) : (
                                <span className={styles.emptyBtnSpace}></span>
                            )}
                            {index === formData.stores.length - 1 ? (
                                <button type="button" onClick={addStore} className={styles.addStoreBtn}>
                                  <Plus size={16} />
                                </button>
                            ) : (
                                <span className={styles.emptyBtnSpace}></span>
                            )}
                          </div>
                        </div>
                    ))
                ) : (
                    <select
                        name="store"
                        value={formData.stores[0] || ''}
                        onChange={(e) => handleStoreChange(0, e.target.value)}
                    >
                      <option value="">Select a store</option>
                      {stores.map(storeOption => (
                          <option key={storeOption.id} value={storeOption.name}>
                            {storeOption.name}
                          </option>
                      ))}
                    </select>
                )}
              </div>

              <div className={styles.submitContainer}>
                <button type="submit" className={styles.registerBtn} disabled={isLoading}>
                  {isLoading ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
            <ToastContainer position="top-right" autoClose={4000} hideProgressBar />
          </div>
        </div>
      </div>
  );
};

export default UserRegistration;