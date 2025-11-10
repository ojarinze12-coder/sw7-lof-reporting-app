
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ChapterReport, EventReport, UserRole, AggregatedData, User, Chapter, Area, Zone, District } from '../types';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'fgbmfiLofReportingData';

// --- INITIAL DEMO DATA ---
const districtId = 'dist1';
const zone1Id = 'zone1', zone2Id = 'zone2';
const area1Id = 'area1', area2Id = 'area2', area3Id = 'area3';

const initialDistricts: District[] = [{ id: districtId, name: 'South West 7' }];
const initialZones: Zone[] = [
    { id: zone1Id, name: 'Island Zone', districtId },
    { id: zone2Id, name: 'Mainland Zone', districtId },
];
const initialAreas: Area[] = [
    { id: area1Id, name: 'Lekki Area', zoneId: zone1Id },
    { id: area2Id, name: 'Ikeja Area', zoneId: zone2Id },
    { id: area3Id, name: 'Festac Area', zoneId: zone2Id },
];
const initialChapters: Chapter[] = [
    { id: 'chap1', name: 'Lekki Chapter', areaId: area1Id },
    { id: 'chap2', name: 'Victoria Island Chapter', areaId: area1Id },
    { id: 'chap3', name: 'Ikeja Chapter', areaId: area2Id },
    { id: 'chap4', name: 'Surulere Chapter', areaId: area3Id },
    { id: 'chap5', name: 'Festac Chapter', areaId: area3Id },
];
const initialUsers: User[] = [
    { id: 'dc1', name: 'DC Grace', role: UserRole.DistrictCoordinator, unitId: districtId, username: 'dcgrace', password: 'password123', email: 'grace@example.com', phone: '08012345678' },
    { id: 'da1', name: 'DA David', role: UserRole.DistrictAdmin, unitId: districtId, username: 'dadavid', password: 'password123', email: 'david@example.com', phone: '08023456789' },
    { id: 'nd1', name: 'ND Funke', role: UserRole.NationalDirector, unitId: zone1Id, username: 'ndfunke', password: 'password123', email: 'funke@example.com', phone: '08034567890' },
    { id: 'nd2', name: 'ND Zainab', role: UserRole.NationalDirector, unitId: zone2Id, username: 'ndzainab', password: 'password123' },
    { id: 'fr1', name: 'FR Adebola', role: UserRole.FieldRepresentative, unitId: area1Id, username: 'fradebola', password: 'password123', email: 'adebola@example.com', phone: '08045678901' },
    { id: 'fr2', name: 'FR Chidinma', role: UserRole.FieldRepresentative, unitId: area2Id, username: 'frchidinma', password: 'password123' },
    { id: 'fr3', name: 'FR Bola', role: UserRole.FieldRepresentative, unitId: area3Id, username: 'frbola', password: 'password123' },
    { id: 'cp1', name: 'CP Titi', role: UserRole.ChapterPresident, unitId: 'chap1', username: 'cptiti', password: 'password123', email: 'titi@example.com', phone: '08056789012' },
    { id: 'cp2', name: 'CP Aisha', role: UserRole.ChapterPresident, unitId: 'chap2', username: 'cpaisha', password: 'password123' },
    { id: 'cp3', name: 'CP Ifeoma', role: UserRole.ChapterPresident, unitId: 'chap3', username: 'cpifeoma', password: 'password123' },
    { id: 'cp4', name: 'CP Amina', role: UserRole.ChapterPresident, unitId: 'chap4', username: 'cpamina', password: 'password123' },
    { id: 'cp5', name: 'CP Fatima', role: UserRole.ChapterPresident, unitId: 'chap5', username: 'cpfatima', password: 'password123' },
    { id: 'admin', name: 'Admin', role: UserRole.Admin, unitId: 'admin', username: 'admin', password: 'admin' },
];

const generateInitialReports = (chapters: Chapter[]): ChapterReport[] => {
    const CURRENT_YEAR = new Date().getFullYear();
    const PREVIOUS_YEAR = CURRENT_YEAR - 1;

    return [PREVIOUS_YEAR, CURRENT_YEAR].flatMap(year =>
        chapters.flatMap((chapter, cIdx) =>
            Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                if (year === CURRENT_YEAR && month > (new Date().getMonth() + 1)) {
                    return null;
                }
                return {
                    id: `${chapter.id}-${year}-${month}`,
                    chapterId: chapter.id,
                    chapterName: chapter.name,
                    month: month,
                    year: year,
                    membership: 50 + cIdx * 5 + month * 2,
                    attendance: 40 + cIdx * 4 + month * 3,
                    firstTimers: 5 + Math.floor(cIdx / 2) + month,
                    salvations: 3 + cIdx % 3 + (month > 1 ? month - 1 : 1),
                    holyGhostBaptism: 2 + cIdx % 2,
                    membershipDecision: 2 + (month > 1 ? month - 1 : 1),
                    offering: 50000 + cIdx * 1000 + month * 500
                };
            })
        ).filter((r): r is ChapterReport => r !== null)
    );
};

const getInitialState = () => {
    try {
        const savedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            return {
                users: parsed.users || initialUsers,
                chapters: parsed.chapters || initialChapters,
                areas: parsed.areas || initialAreas,
                zones: parsed.zones || initialZones,
                districts: parsed.districts || initialDistricts,
                chapterReports: parsed.chapterReports || generateInitialReports(initialChapters),
                eventReports: parsed.eventReports || [],
            };
        }
    } catch (error) {
        console.error("Failed to read state from localStorage:", error);
    }
    return {
        users: initialUsers,
        chapters: initialChapters,
        areas: initialAreas,
        zones: initialZones,
        districts: initialDistricts,
        chapterReports: generateInitialReports(initialChapters),
        eventReports: [],
    };
};

interface DataContextType {
  users: User[];
  chapters: Chapter[];
  areas: Area[];
  zones: Zone[];
  districts: District[];
  chapterReports: ChapterReport[];
  eventReports: EventReport[];
  
  // Auth
  authenticateUser: (username: string, password?: string) => User | null;
  changePassword: (userId: string, currentPassword?: string, newPassword?: string) => { success: boolean, message: string };

  // CRUD Operations
  updateUser: (user: User) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (userId: string) => void;
  
  updateChapter: (chapter: Chapter) => void;
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  deleteChapter: (chapterId: string) => void;

  updateArea: (area: Area) => void;
  addArea: (area: Omit<Area, 'id'>) => void;
  deleteArea: (areaId: string) => void;
  
  updateZone: (zone: Zone) => void;
  addZone: (zone: Omit<Zone, 'id'>) => void;
  deleteZone: (zoneId: string) => void;

  updateDistrict: (district: District) => void;
  addDistrict: (district: Omit<District, 'id'>) => void;
  deleteDistrict: (districtId: string) => void;

  // Reporting
  addChapterReport: (report: Omit<ChapterReport, 'id'>) => void;
  addEventReport: (report: Omit<EventReport, 'id'>) => void;
  getAggregatedData: (role: UserRole, userId: string, startDate?: string, endDate?: string) => AggregatedData | null;
  getChapterReports: (chapterId: string, startDate?: string, endDate?: string) => ChapterReport[];

  // Admin
  performYearEndProcess: (archiveUpToYear: number) => { archivedData: string, clearedCount: number };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generic CRUD handlers
const createUpdater = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (item: T) => {
  setter(prev => prev.map(i => i.id === item.id ? item : i));
};
const createAdder = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (item: Omit<T, 'id'>) => {
  setter(prev => [...prev, { ...item, id: uuidv4() } as T]);
};
const createDeleter = <T extends { id: string }>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (id: string) => {
  setter(prev => prev.filter(i => i.id !== id));
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(getInitialState().users);
  const [chapters, setChapters] = useState<Chapter[]>(getInitialState().chapters);
  const [areas, setAreas] = useState<Area[]>(getInitialState().areas);
  const [zones, setZones] = useState<Zone[]>(getInitialState().zones);
  const [districts, setDistricts] = useState<District[]>(getInitialState().districts);
  const [chapterReports, setChapterReports] = useState<ChapterReport[]>(getInitialState().chapterReports);
  const [eventReports, setEventReports] = useState<EventReport[]>(getInitialState().eventReports);

  useEffect(() => {
    try {
        const stateToSave = { users, chapters, areas, zones, districts, chapterReports, eventReports };
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error("Failed to write state to localStorage:", error);
    }
  }, [users, chapters, areas, zones, districts, chapterReports, eventReports]);
  

  // Auth
  const authenticateUser = useCallback((username: string, password?: string): User | null => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.password === password) {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  }, [users]);
  
  const changePassword = useCallback((userId: string, currentPassword?: string, newPassword?: string): { success: boolean, message: string } => {
    setUsers(prevUsers => {
        const userIndex = prevUsers.findIndex(u => u.id === userId);
        if (userIndex === -1) return prevUsers;
        
        const user = prevUsers[userIndex];
        if (!newPassword || newPassword.length < 1) {
            // This case should be handled by form validation, but as a safeguard.
            return prevUsers; 
        }
        if (user.password !== currentPassword) {
            // This check should also be in the component to provide immediate feedback.
            return prevUsers;
        }

        const updatedUsers = [...prevUsers];
        updatedUsers[userIndex] = { ...user, password: newPassword };
        return updatedUsers;
    });
    // The success/message logic is better handled in the component calling this.
    // For this implementation, we assume if it reaches here, it's a success for state update.
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false, message: "User not found." };
    if (!newPassword) return { success: false, message: "New password cannot be empty." };
    if (user.password !== currentPassword) return { success: false, message: "Current password does not match." };
    
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    return { success: true, message: "Password updated successfully." };
  }, [users]);

  // CRUD Implementations
  const updateUser = (userToUpdate: User) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userToUpdate.id) {
        // Only update the password if a new, non-empty password string is provided.
        // Otherwise, always preserve the existing password.
        const newPassword = userToUpdate.password && userToUpdate.password.length > 0
            ? userToUpdate.password
            : u.password;
        
        return { ...userToUpdate, password: newPassword };
      }
      return u;
    }));
  };
  const addUser = createAdder(setUsers);
  const deleteUser = createDeleter(setUsers);
  const updateChapter = createUpdater(setChapters);
  const addChapter = createAdder(setChapters);
  const deleteChapter = createDeleter(setChapters);
  const updateArea = createUpdater(setAreas);
  const addArea = createAdder(setAreas);
  const deleteArea = createDeleter(setAreas);
  const updateZone = createUpdater(setZones);
  const addZone = createAdder(setZones);
  const deleteZone = createDeleter(setZones);
  const updateDistrict = createUpdater(setDistricts);
  const addDistrict = createAdder(setDistricts);
  const deleteDistrict = createDeleter(setDistricts);

  const addChapterReport = useCallback((report: Omit<ChapterReport, 'id'>) => {
    setChapterReports(prev => {
      const existingIndex = prev.findIndex(r => r.chapterId === report.chapterId && r.month === report.month && r.year === report.year);
      const newReport = { ...report, id: `${report.chapterId}-${report.year}-${report.month}` };
      if (existingIndex > -1) {
        const updatedReports = [...prev];
        updatedReports[existingIndex] = newReport;
        return updatedReports;
      }
      return [...prev, newReport];
    });
  }, []);

  const addEventReport = useCallback((report: Omit<EventReport, 'id'>) => {
    setEventReports(prev => [...prev, { ...report, id: uuidv4() }]);
  }, []);

  const getChapterReports = useCallback((chapterId: string, startDate?: string, endDate?: string): ChapterReport[] => {
    let reports = chapterReports.filter(r => r.chapterId === chapterId);
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        reports = reports.filter(r => {
            const reportDate = new Date(r.year, r.month - 1, 15);
            return reportDate >= start && reportDate <= end;
        });
    }
    return reports.sort((a, b) => b.year - a.year || b.month - a.month);
  }, [chapterReports]);

  const getAggregatedData = useCallback((role: UserRole, userId: string, startDate?: string, endDate?: string): AggregatedData | null => {
      const user = users.find(u => u.id === userId);
      if (!user) return null;

      let filteredChapterReports = chapterReports;
      let filteredEventReports = eventReports;

      if (startDate && endDate) {
          const start = new Date(startDate);
          // Set end date to the end of the day
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);

          filteredChapterReports = chapterReports.filter(r => {
              const reportDate = new Date(r.year, r.month - 1, 15);
              return reportDate >= start && reportDate <= end;
          });
          filteredEventReports = eventReports.filter(e => {
              const eventDate = new Date(e.eventDate);
              return eventDate >= start && eventDate <= end;
          });
      }

      const aggregateMetrics = (reports: (ChapterReport | EventReport)[]) => reports.reduce((acc, report) => {
          acc.membership += report.membership;
          acc.attendance += report.attendance;
          acc.firstTimers += report.firstTimers;
          acc.salvations += report.salvations;
          acc.holyGhostBaptism += report.holyGhostBaptism;
          acc.membershipDecision += report.membershipDecision;
          acc.offering += report.offering;
          return acc;
      }, { membership: 0, attendance: 0, firstTimers: 0, salvations: 0, holyGhostBaptism: 0, membershipDecision: 0, offering: 0 });

      const getChapterData = (chapter: Chapter): AggregatedData => {
          const reports = filteredChapterReports.filter(r => r.chapterId === chapter.id);
          return { name: chapter.name, reports, ...aggregateMetrics(reports) };
      };

      const getAreaData = (area: Area): AggregatedData => {
          const supervisedChapters = chapters.filter(c => c.areaId === area.id);
          const children = supervisedChapters.map(getChapterData);
          const allChildReports = children.flatMap(c => c.reports);
          const areaFR = users.find(u => u.role === UserRole.FieldRepresentative && u.unitId === area.id);
          const events = areaFR ? filteredEventReports.filter(e => e.reportingOfficerId === areaFR.id) : [];
          return { name: area.name, reports: [...allChildReports, ...events], ...aggregateMetrics([...allChildReports, ...events]), children, events };
      };
      
      const getZoneData = (zone: Zone): AggregatedData => {
          const supervisedAreas = areas.filter(a => a.zoneId === zone.id);
          const children = supervisedAreas.map(getAreaData);
          const allChildReports = children.flatMap(c => c.reports);
          const zoneND = users.find(u => u.role === UserRole.NationalDirector && u.unitId === zone.id);
          const events = zoneND ? filteredEventReports.filter(e => e.reportingOfficerId === zoneND.id) : [];
          return { name: zone.name, reports: [...allChildReports, ...events], ...aggregateMetrics([...allChildReports, ...events]), children, events };
      };

      const getDistrictData = (district: District): AggregatedData => {
          const supervisedZones = zones.filter(z => z.districtId === district.id);
          const children = supervisedZones.map(getZoneData);
          const allChildReports = children.flatMap(c => c.reports);
          const districtDC = users.find(u => u.role === UserRole.DistrictCoordinator && u.unitId === district.id);
          const events = districtDC ? filteredEventReports.filter(e => e.reportingOfficerId === districtDC.id) : [];
          return { name: district.name, reports: [...allChildReports, ...events], ...aggregateMetrics([...allChildReports, ...events]), children, events };
      };
      
      const getAllData = (): AggregatedData => {
          const allDistrictData = districts.map(getDistrictData);
          const allReports = allDistrictData.flatMap(d => d.reports);
          const combinedMetrics = aggregateMetrics(allReports);
          return {
              name: 'FGBMFI-NG LOF SW7',
              reports: allReports,
              ...combinedMetrics,
              children: allDistrictData,
              events: allDistrictData.flatMap(d => d.events || []),
          };
      };

      switch(role) {
        case UserRole.FieldRepresentative: {
            const area = areas.find(a => a.id === user.unitId);
            return area ? getAreaData(area) : null;
        }
        case UserRole.NationalDirector: {
            const zone = zones.find(z => z.id === user.unitId);
            return zone ? getZoneData(zone) : null;
        }
        case UserRole.DistrictCoordinator:
        case UserRole.DistrictAdmin: { // District Admin sees the same data view as DC
            const district = districts.find(d => d.id === user.unitId);
            return district ? getDistrictData(district) : null;
        }
        case UserRole.Admin: return getAllData();
        case UserRole.ChapterPresident: return null; // CP data is handled differently, not aggregated at this level.
        default: return null;
      }
  }, [chapterReports, eventReports, users, chapters, areas, zones, districts]);

  const performYearEndProcess = useCallback((archiveUpToYear: number): { archivedData: string, clearedCount: number } => {
    const chapterReportsToArchive = chapterReports.filter(r => r.year <= archiveUpToYear);
    const eventReportsToArchive = eventReports.filter(e => new Date(e.eventDate).getFullYear() <= archiveUpToYear);

    const archive = {
        archiveDate: new Date().toISOString(),
        archivedUpToYear: archiveUpToYear,
        chapterReports: chapterReportsToArchive,
        eventReports: eventReportsToArchive,
    };

    const archivedData = JSON.stringify(archive, null, 2);

    const chapterReportsToKeep = chapterReports.filter(r => r.year > archiveUpToYear);
    const eventReportsToKeep = eventReports.filter(e => new Date(e.eventDate).getFullYear() > archiveUpToYear);

    setChapterReports(chapterReportsToKeep);
    setEventReports(eventReportsToKeep);

    return { archivedData, clearedCount: chapterReportsToArchive.length + eventReportsToArchive.length };
  }, [chapterReports, eventReports]);


  const value = {
      users, chapters, areas, zones, districts, chapterReports, eventReports,
      authenticateUser, changePassword,
      updateUser, addUser, deleteUser,
      updateChapter, addChapter, deleteChapter,
      updateArea, addArea, deleteArea,
      updateZone, addZone, deleteZone,
      updateDistrict, addDistrict, deleteDistrict,
      addChapterReport, addEventReport,
      getAggregatedData, getChapterReports,
      performYearEndProcess,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
