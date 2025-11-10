import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../hooks/useDataContext';
import { UserRole, User, Chapter, Area, Zone, District } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import DCReportView from './DCReportView';

type ManageableEntity = 'Users' | 'Chapters' | 'Areas' | 'Zones' | 'Districts';
type AdminTab = 'Data View' | 'Management';

interface AdminViewProps {
    user: User;
}

const AdminView: React.FC<AdminViewProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('Data View');
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-800">Admin Panel</h2>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {(['Data View', 'Management'] as AdminTab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`${activeTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                            {tab}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'Data View' && <DCReportView dcName={user.name} dcId={user.id} isAdminView={true} />}
            {activeTab === 'Management' && <ManagementView user={user} />}
        </div>
    );
};


const ManagementView: React.FC<AdminViewProps> = ({ user }) => {
    const { 
        users, addUser, updateUser, deleteUser,
        chapters, addChapter, updateChapter, deleteChapter,
        areas, addArea, updateArea, deleteArea,
        zones, addZone, updateZone, deleteZone,
        districts, addDistrict, updateDistrict, deleteDistrict,
        changePassword,
    } = useData();

    const [activeMgmtTab, setActiveMgmtTab] = useState<ManageableEntity>('Users');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // --- Role-Based Data Filtering ---
    const isDistrictAdmin = user.role === UserRole.DistrictAdmin;

    const visibleDistricts = useMemo(() => {
        return isDistrictAdmin ? districts.filter(d => d.id === user.unitId) : districts;
    }, [districts, isDistrictAdmin, user.unitId]);
    const visibleDistrictIds = useMemo(() => new Set(visibleDistricts.map(d => d.id)), [visibleDistricts]);
    
    const visibleZones = useMemo(() => {
        return isDistrictAdmin ? zones.filter(z => visibleDistrictIds.has(z.districtId)) : zones;
    }, [zones, isDistrictAdmin, visibleDistrictIds]);
    const visibleZoneIds = useMemo(() => new Set(visibleZones.map(z => z.id)), [visibleZones]);

    const visibleAreas = useMemo(() => {
        return isDistrictAdmin ? areas.filter(a => visibleZoneIds.has(a.zoneId)) : areas;
    }, [areas, isDistrictAdmin, visibleZoneIds]);
    const visibleAreaIds = useMemo(() => new Set(visibleAreas.map(a => a.id)), [visibleAreas]);

    const visibleChapters = useMemo(() => {
        return isDistrictAdmin ? chapters.filter(c => visibleAreaIds.has(c.areaId)) : chapters;
    }, [chapters, isDistrictAdmin, visibleAreaIds]);
    const visibleChapterIds = useMemo(() => new Set(visibleChapters.map(c => c.id)), [visibleChapters]);

    const visibleUsers = useMemo(() => {
        if (!isDistrictAdmin) return users;
        return users.filter(u => {
            if (u.id === user.id) return true; // Can see self
            switch(u.role) {
                case UserRole.ChapterPresident: return visibleChapterIds.has(u.unitId);
                case UserRole.FieldRepresentative: return visibleAreaIds.has(u.unitId);
                case UserRole.NationalDirector: return visibleZoneIds.has(u.unitId);
                case UserRole.DistrictCoordinator:
                case UserRole.DistrictAdmin: return visibleDistrictIds.has(u.unitId);
                default: return false;
            }
        });
    }, [users, isDistrictAdmin, user.id, visibleChapterIds, visibleAreaIds, visibleZoneIds, visibleDistrictIds]);


    const openModal = (item: any = null) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingItem(null);
        setIsModalOpen(false);
    };

    const handleSave = (formData: any) => {
        const isEditing = !!editingItem;
        switch (activeMgmtTab) {
            case 'Users': isEditing ? updateUser(formData) : addUser(formData); break;
            case 'Chapters': isEditing ? updateChapter(formData) : addChapter(formData); break;
            case 'Areas': isEditing ? updateArea(formData) : addArea(formData); break;
            case 'Zones': isEditing ? updateZone(formData) : addZone(formData); break;
            case 'Districts': isEditing ? updateDistrict(formData) : addDistrict(formData); break;
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            switch (activeMgmtTab) {
                case 'Users': deleteUser(id); break;
                case 'Chapters': deleteChapter(id); break;
                case 'Areas': deleteArea(id); break;
                case 'Zones': deleteZone(id); break;
                case 'Districts': deleteDistrict(id); break;
            }
        }
    };

    const nameMaps = useMemo(() => ({
        chapters: new Map(chapters.map(c => [c.id, c.name])),
        areas: new Map(areas.map(a => [a.id, a.name])),
        zones: new Map(zones.map(z => [z.id, z.name])),
        districts: new Map(districts.map(d => [d.id, d.name])),
    }), [chapters, areas, zones, districts]);

    const renderTable = () => {
        const commonActions = (item: any) => (
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => openModal(item)} className="text-amber-600 hover:text-amber-900 mr-4">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
            </td>
        );

        switch (activeMgmtTab) {
            case 'Users': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead><tr><th className="th">Name</th><th className="th">Role</th><th className="th">Unit</th><th className="th">Email</th><th className="th">Phone</th><th className="th-action"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visibleUsers.filter(u => u.role !== UserRole.Admin && u.id !== user.id).map(userItem => (
                            <tr key={userItem.id}>
                                <td className="td">{userItem.name} <span className="block text-xs text-slate-400 font-mono">@{userItem.username}</span></td>
                                <td className="td">{userItem.role}</td>
                                <td className="td">
                                    {userItem.role === UserRole.ChapterPresident && nameMaps.chapters.get(userItem.unitId)}
                                    {userItem.role === UserRole.FieldRepresentative && nameMaps.areas.get(userItem.unitId)}
                                    {userItem.role === UserRole.NationalDirector && nameMaps.zones.get(userItem.unitId)}
                                    {(userItem.role === UserRole.DistrictCoordinator || userItem.role === UserRole.DistrictAdmin) && nameMaps.districts.get(userItem.unitId)}
                                </td>
                                <td className="td font-mono text-xs">{userItem.email || 'N/A'}</td>
                                <td className="td font-mono text-xs">{userItem.phone || 'N/A'}</td>
                                {commonActions(userItem)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
            case 'Chapters': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead><tr><th className="th">Name</th><th className="th">Area</th><th className="th-action"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visibleChapters.map(item => (
                            <tr key={item.id}><td className="td">{item.name}</td><td className="td">{nameMaps.areas.get(item.areaId)}</td>{commonActions(item)}</tr>
                        ))}
                    </tbody>
                </table>
            );
            case 'Areas': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead><tr><th className="th">Name</th><th className="th">Zone</th><th className="th-action"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visibleAreas.map(item => (
                            <tr key={item.id}><td className="td">{item.name}</td><td className="td">{nameMaps.zones.get(item.zoneId)}</td>{commonActions(item)}</tr>
                        ))}
                    </tbody>
                </table>
            );
             case 'Zones': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead><tr><th className="th">Name</th><th className="th">District</th><th className="th-action"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visibleZones.map(item => (
                            <tr key={item.id}><td className="td">{item.name}</td><td className="td">{nameMaps.districts.get(item.districtId)}</td>{commonActions(item)}</tr>
                        ))}
                    </tbody>
                </table>
            );
            case 'Districts': return (
                <table className="min-w-full divide-y divide-slate-200">
                    <thead><tr><th className="th">Name</th><th className="th-action"></th></tr></thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {visibleDistricts.map(item => (
                            <tr key={item.id}><td className="td">{item.name}</td>{commonActions(item)}</tr>
                        ))}
                    </tbody>
                </table>
            );
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <ChangePasswordForm user={user} changePassword={changePassword} />
            <YearEndProcess />

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="border-b border-slate-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {(['Users', 'Chapters', 'Areas', 'Zones', 'Districts'] as ManageableEntity[]).map(tab => (
                                <button key={tab} onClick={() => setActiveMgmtTab(tab)} className={`${activeMgmtTab === tab ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                    {tab}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <Button onClick={() => openModal()} disabled={activeMgmtTab === 'Districts' && isDistrictAdmin}>Add New {activeMgmtTab.slice(0, -1)}</Button>
                </div>
                <div className="overflow-x-auto">{renderTable()}</div>
            </Card>

            <EntityFormModal 
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={handleSave}
                entityType={activeMgmtTab}
                item={editingItem}
                data={{ chapters: visibleChapters, areas: visibleAreas, zones: visibleZones, districts: visibleDistricts }}
                user={user}
            />
        </div>
    );
};

// --- YEAR END PROCESS ---
const YearEndProcess: React.FC = () => {
    const { performYearEndProcess } = useData();
    const [year, setYear] = useState(new Date().getFullYear() - 1);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    const handleInitialArchiveClick = () => {
        setStatusMessage(null);
        if (!year || year >= new Date().getFullYear()) {
            setStatusMessage('Please select a valid past year to archive.');
            return;
        }
        setIsConfirming(true);
    };

    const handleConfirmArchive = () => {
        setIsProcessing(true);
        setIsConfirming(false);

        try {
            const { archivedData, clearedCount } = performYearEndProcess(year);

            // Trigger download
            const blob = new Blob([archivedData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `fgbmfi_lof_archive_up_to_${year}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            setStatusMessage(`Successfully archived and cleared ${clearedCount} report(s) up to year ${year}. The archive file has been downloaded.`);
        } catch (e) {
            setStatusMessage(`An error occurred: ${e instanceof Error ? e.message : String(e)}`);
        } finally {
            setIsProcessing(false);
        }
    }

    const handleCancelArchive = () => {
        setIsConfirming(false);
        setStatusMessage('Archive process cancelled.');
    }
    
    const WarningIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
    );

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-800 mb-2">System Maintenance</h3>
            <p className="text-sm text-slate-500 mb-4">Perform end-of-year processes to archive old data and initialize the new year.</p>
            <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-800 mb-4">
                <p className="font-bold">Critical Action</p>
                <p className="text-sm">This is a destructive action. Archiving and clearing data will permanently remove it from the live application. Always ensure you have saved the downloaded archive file safely.</p>
            </div>
             <div className="flex items-end gap-4">
                <div>
                    <label className="label">Archive & Clear Data Up To Year</label>
                    <input 
                        type="number" 
                        value={year} 
                        onChange={e => setYear(Number(e.target.value))} 
                        className="input" 
                        max={new Date().getFullYear() - 1}
                        disabled={isConfirming || isProcessing}
                    />
                </div>
                {!isConfirming ? (
                    <Button onClick={handleInitialArchiveClick} isLoading={isProcessing} disabled={isConfirming}>
                        Archive & Initialize New Year
                    </Button>
                ) : (
                    <div className="flex items-end gap-2">
                        <Button 
                            onClick={handleConfirmArchive} 
                            variant="primary" 
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                            disabled={isProcessing}
                        >
                            <WarningIcon className="h-5 w-5" />
                            Confirm for {year}
                        </Button>
                        <Button onClick={handleCancelArchive} variant="secondary" disabled={isProcessing}>
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
            {statusMessage && <p className="text-sm mt-4 text-slate-600">{statusMessage}</p>}
        </Card>
    );
}


// --- CHANGE PASSWORD FORM ---
const ChangePasswordForm: React.FC<{user: User, changePassword: Function}> = ({ user, changePassword }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword !== confirmPassword) {
            setMessage({ text: 'New passwords do not match.', type: 'error' });
            return;
        }
        if (newPassword.length < 6) {
            setMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        const result = changePassword(user.id, currentPassword, newPassword);
        setMessage({ text: result.message, type: result.success ? 'success' : 'error'});
        if (result.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    }

    return (
        <Card>
            <h3 className="text-xl font-bold text-slate-800 mb-4">Change My Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input" required />
                    </div>
                    <div>
                        <label className="label">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" required />
                    </div>
                    <div>
                        <label className="label">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required />
                    </div>
                </div>
                 {message && <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message.text}</p>}
                <div className="text-right">
                    <Button type="submit">Update Password</Button>
                </div>
            </form>
        </Card>
    )
}

// --- FORM MODAL ---
interface EntityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any) => void;
    entityType: ManageableEntity;
    item: any;
    data: { chapters: Chapter[], areas: Area[], zones: Zone[], districts: District[] };
    user: User;
}

const EntityFormModal: React.FC<EntityFormModalProps> = ({ isOpen, onClose, onSave, entityType, item, data, user }) => {
    const [formData, setFormData] = useState<Partial<User & Chapter & Area & Zone & District>>({});
    const isDistrictAdmin = user.role === UserRole.DistrictAdmin;
    
    useEffect(() => {
        if (isOpen) {
            const { password, ...itemWithoutPassword } = item || {};
            setFormData(item ? itemWithoutPassword : {});
        }
    }, [isOpen, item]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalData = { ...formData };
        if (isDistrictAdmin) {
            // Ensure DistrictAdmin cannot assign units outside their scope
            if (entityType === 'Zones') finalData.districtId = user.unitId;
            if (entityType === 'Users' && (formData.role === UserRole.DistrictCoordinator || formData.role === UserRole.DistrictAdmin)) {
                finalData.unitId = user.unitId;
            }
        }
        onSave(finalData);
    };

    const renderFormFields = () => {
        const commonNameField = <div className="mb-4"><label className="label">Full Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required /></div>;

        switch (entityType) {
            case 'Users': return (
                <>
                    {commonNameField}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div><label className="label">Email Address</label><input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="input" placeholder="user@example.com" /></div>
                        <div><label className="label">Phone Number</label><input type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} className="input" placeholder="08012345678" /></div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div><label className="label">Username</label><input type="text" name="username" value={formData.username || ''} onChange={handleChange} className="input" required /></div>
                        <div><label className="label">Password</label><input type="password" name="password" value={formData.password || ''} onChange={handleChange} className="input" placeholder={item ? "Leave blank to keep same" : ""} required={!item} /></div>
                    </div>
                    <div className="mb-4"><label className="label">Role</label><select name="role" value={formData.role || ''} onChange={handleChange} className="input" required>
                        <option value="" disabled>Select a role</option>
                        {Object.values(UserRole).filter(r => r !== UserRole.Admin).map(r => <option key={r} value={r}>{r}</option>)}
                    </select></div>
                    {formData.role && <div className="mb-4"><label className="label">Assign to Unit</label><select name="unitId" value={formData.unitId || ''} onChange={handleChange} className="input" required>
                        <option value="" disabled>Select a unit</option>
                        {formData.role === UserRole.ChapterPresident && data.chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        {formData.role === UserRole.FieldRepresentative && data.areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        {formData.role === UserRole.NationalDirector && data.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        {(formData.role === UserRole.DistrictCoordinator || formData.role === UserRole.DistrictAdmin) && data.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select></div>}
                </>
            );
            case 'Chapters': return <><div className="mb-4"><label className="label">Chapter Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required /></div><div className="mb-4"><label className="label">Area</label><select name="areaId" value={formData.areaId || ''} onChange={handleChange} className="input" required><option value="" disabled>Select an Area</option>{data.areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div></>;
            case 'Areas': return <><div className="mb-4"><label className="label">Area Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required /></div><div className="mb-4"><label className="label">Zone</label><select name="zoneId" value={formData.zoneId || ''} onChange={handleChange} className="input" required><option value="" disabled>Select a Zone</option>{data.zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}</select></div></>;
            case 'Zones': return <><div className="mb-4"><label className="label">Zone Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required /></div><div className="mb-4"><label className="label">District</label><select name="districtId" value={formData.districtId || (isDistrictAdmin ? user.unitId : '')} onChange={handleChange} className="input" required disabled={isDistrictAdmin}><option value="" disabled>Select a District</option>{data.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div></>;
            case 'Districts': return <div className="mb-4"><label className="label">District Name</label><input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="input" required disabled={isDistrictAdmin} /></div>;
            default: return null;
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${item ? 'Edit' : 'Add'} ${entityType.slice(0, -1)}`}>
            <form onSubmit={handleSubmit}>
                {renderFormFields()}
                <div className="flex justify-end gap-3 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};


export default AdminView;