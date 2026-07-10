import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Search, 
  Plus, 
  RotateCcw, 
  Edit, 
  Trash2, 
  X 
} from 'lucide-react';
import { localStorageService } from '../../core/services/localStorageService';
import './EmergencyListScreen.css';

export default function EmergencyListScreen() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDesc, setFormDesc] = useState('');

  const loadContacts = () => {
    setContacts(localStorageService.getEmergencyContacts());
  };

  useEffect(() => {
    loadContacts();
    setCurrentUser(localStorageService.getCurrentUser());
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormPhone('');
    setFormDesc('');
    setShowModal(true);
  };

  const handleOpenEdit = (contact) => {
    setEditingContact(contact);
    setFormName(contact.serviceName);
    setFormPhone(contact.phoneNumber);
    setFormDesc(contact.description || '');
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kontak darurat ini?')) {
      localStorageService.deleteEmergencyContact(id);
      loadContacts();
    }
  };

  const handleReset = () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan daftar ke kontak darurat standar?')) {
      localStorageService.resetEmergencyContacts();
      loadContacts();
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formName || !formPhone) {
      alert('Nama Layanan dan Nomor Telepon wajib diisi!');
      return;
    }

    if (editingContact) {
      // Edit
      localStorageService.updateEmergencyContact({
        id: editingContact.id,
        serviceName: formName,
        phoneNumber: formPhone,
        description: formDesc
      });
    } else {
      // Add new
      localStorageService.addEmergencyContact({
        id: 'ec_' + Date.now(),
        serviceName: formName,
        phoneNumber: formPhone,
        description: formDesc
      });
    }

    setShowModal(false);
    loadContacts();
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter(contact => 
    contact.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (contact.description && contact.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="emergency-container fade-in">
      {/* Title */}
      <div className="emergency-header-row">
        <div>
          <h2 className="home-welcome-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Phone size={28} color="var(--emergency-red)" /> Bantuan Darurat
          </h2>
          <p className="home-welcome-subtitle">Hubungi ambulans atau posko kesehatan terdekat segera.</p>
        </div>
      </div>

      {/* Action Row: Search & Management Buttons */}
      <div className="action-row">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Cari kontak darurat..." 
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <button className="nav-btn primary" onClick={handleOpenAdd} style={{ padding: '0 16px', gap: '4px' }}>
          <Plus size={16} /> Tambah
        </button>

        {isAdmin && (
          <button className="nav-btn" onClick={handleReset} style={{ padding: '0 12px' }} title="Reset ke Default">
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      {/* Contacts List */}
      <div className="contact-card-list">
        {filteredContacts.length > 0 ? (
          filteredContacts.map(contact => (
            <div key={contact.id} className="contact-card">
              <div className="contact-details">
                <h3 className="contact-name">{contact.serviceName}</h3>
                <span className="contact-phone">{contact.phoneNumber}</span>
                {contact.description && <p className="contact-desc">{contact.description}</p>}
              </div>

              <div className="contact-actions">
                <a href={`tel:${contact.phoneNumber.replace(/[^0-9]/g, '')}`} className="call-btn" title="Hubungi">
                  <Phone size={20} fill="var(--mitigation-green)" />
                </a>
                {isAdmin && (
                  <>
                    <button className="edit-btn" onClick={() => handleOpenEdit(contact)} title="Ubah">
                      <Edit size={16} />
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(contact.id)} title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlignment: 'center', color: 'var(--text-gray)', padding: '40px 0', fontWeight: 600 }}>
            Tidak ada kontak darurat yang ditemukan.
          </div>
        )}
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <form className="modal-content" onSubmit={handleSave}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900 }}>
                {editingContact ? 'Ubah Kontak Darurat' : 'Tambah Kontak Darurat'}
              </h3>
              <button 
                type="button" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-gray)' }}
                onClick={() => setShowModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Service Name */}
            <div className="form-group">
              <label className="form-label">Nama Instansi / Layanan *</label>
              <input 
                type="text" 
                placeholder="Contoh: Ambulans RS Sanglah" 
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">Nomor Telepon *</label>
              <input 
                type="text" 
                placeholder="Contoh: 118" 
                className="form-input"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Keterangan (Opsional)</label>
              <input 
                type="text" 
                placeholder="Contoh: UGD Siaga 24 Jam" 
                className="form-input"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
              />
            </div>

            <div className="modal-buttons">
              <button type="button" className="nav-btn" onClick={() => setShowModal(false)}>
                Batal
              </button>
              <button type="submit" className="nav-btn primary">
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
