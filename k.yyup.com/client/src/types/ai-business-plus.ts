/**
 * AI业务核心Plus - 智能化数据类型定义
 * 
 * 包含学生成长分析、教师效能分析、班级管理、家长沟通等AI智能化功能的数据类型
 */

// 基础接口
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  code?: number;
}

// ====== 智能学生成长分析系统 ======

export interface GrowthMetric {
  currentLevel: number;
  progress: number;
  trend: 'improving' | 'stable' | 'declining';
  benchmark: number;
  recommendations: string[];
  lastUpdated: string;
}

export interface BehaviorAnalysis {
  attention: number;
  cooperation: number;
  independence: number;
  emotional: number;
  creativity: number;
  communication: number;
}

export interface PersonalizedRecommendation {
  id: string;
  type: 'learning' | 'behavioral' | 'social' | 'creative';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedOutcome: string;
  timeframe: string;
  resources: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  category: 'cognitive' | 'physical' | 'social' | 'emotional';
  targetDate: string;
  predictedDate: string;
  progress: number;
  isAchieved: boolean;
  achievedDate?: string;
}

export interface GrowthPrediction {
  shortTerm: {
    period: string;
    predictions: Array<{
      domain: string;
      expectedGrowth: number;
      confidence: number;
    }>;
  };
  longTerm: {
    period: string;
    predictions: Array<{
      domain: string;
      expectedGrowth: number;
      confidence: number;
    }>;
  };
}

export interface StudentGrowthAnalytics {
  studentId: string;
  studentName: string;
  analysisDate: string;
  cognitiveGrowth: {
    language: GrowthMetric;
    mathematics: GrowthMetric;
    science: GrowthMetric;
    social: GrowthMetric;
    creative: GrowthMetric;
  };
  behaviorAnalysis: BehaviorAnalysis;
  recommendations: PersonalizedRecommendation[];
  milestones: Milestone[];
  growthPrediction: GrowthPrediction;
  overallScore: number;
  progressSummary: string;
}

export interface LearningPlan {
  id: string;
  studentId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  objectives: string[];
  activities: LearningActivity[];
  resources: LearningResource[];
  assessmentCriteria: string[];
  parentInvolvement: string[];
  expectedOutcomes: string[];
}

export interface LearningActivity {
  id: string;
  title: string;
  type: 'individual' | 'group' | 'hands-on' | 'digital';
  duration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  materials: string[];
  instructions: string[];
  learningObjectives: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: 'book' | 'video' | 'game' | 'worksheet' | 'app';
  url?: string;
  description: string;
  ageGroup: string;
  difficulty: string;
}

// ====== 智能教师效能分析系统 ======

export interface TeacherPerformanceMetric {
  key: string;
  label: string;
  value: string;
  numericValue: number;
  trend: 'up' | 'down' | 'stable';
  benchmark: number;
  improvement: number;
}

export interface TeachingInsight {
  id: string;
  category: 'method' | 'engagement' | 'management' | 'communication';
  title: string;
  text: string;
  impact: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  suggestions: string[];
}

export interface EngagementTip {
  id: string;
  category: 'attention' | 'participation' | 'motivation' | 'interaction';
  suggestion: string;
  implementation: string;
  expectedImprovement: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface CourseOptimization {
  id: string;
  title: string;
  currentMethod: string;
  suggestedMethod: string;
  reason: string;
  expectedImprovement: string;
  implementationSteps: string[];
  requiredResources: string[];
  timeToImplement: string;
}

export interface DevelopmentPhase {
  id: string;
  title: string;
  description: string;
  duration: string;
  objectives: string[];
  resources: Array<{
    id: string;
    type: 'course' | 'book' | 'workshop' | 'webinar' | 'certification';
    title: string;
    provider: string;
    url?: string;
    cost?: string;
    duration?: string;
  }>;
  assessmentCriteria: string[];
  milestones: string[];
}

export interface ScheduleOptimization {
  id: string;
  title: string;
  currentSchedule: string;
  suggestedSchedule: string;
  reason: string;
  impact: string;
  conflictResolution: string[];
  resourceRequirements: string[];
}

export interface TeacherPerformanceAnalysis {
  teacherId: string;
  teacherName: string;
  analysisDate: string;
  overallScore: number;
  metrics: TeacherPerformanceMetric[];
  insights: TeachingInsight[];
  engagementTips: EngagementTip[];
  courseOptimizations: CourseOptimization[];
  developmentPlan: DevelopmentPhase[];
  scheduleOptimizations: ScheduleOptimization[];
  strengths: string[];
  improvementAreas: string[];
  nextReviewDate: string;
}

// ====== 智能班级管理系统 ======

export interface ConflictEvent {
  id: string;
  type: 'behavioral' | 'academic' | 'social' | 'emotional';
  severity: 'low' | 'medium' | 'high' | 'critical';
  participants: string[];
  participantNames: string[];
  description: string;
  location: string;
  timestamp: string;
  suggestedResolution: string;
  status: 'pending' | 'in_progress' | 'resolved';
  followUpRequired: boolean;
}

export interface ClassAtmosphere {
  classId: string;
  timestamp: string;
  overallMood: 'positive' | 'neutral' | 'negative';
  energyLevel: number; // 1-10
  participationRate: number; // 0-100
  collaborationIndex: number; // 0-100
  attentionLevel: number; // 0-100
  disruptionLevel: number; // 0-100
  conflicts: ConflictEvent[];
  recommendations: string[];
  environmentalFactors: {
    temperature: number;
    noise: number;
    lighting: string;
    crowding: number;
  };
}

export interface StudentDynamic {
  studentId: string;
  studentName: string;
  role: 'leader' | 'follower' | 'independent' | 'withdrawn';
  socialConnections: Array<{
    studentId: string;
    studentName: string;
    relationshipType: 'friend' | 'peer' | 'conflict';
    strength: number;
  }>;
  behaviorPatterns: {
    aggression: number;
    cooperation: number;
    helpfulness: number;
    attention: number;
  };
  riskFactors: string[];
  interventionNeeds: string[];
}

export interface Intervention {
  id: string;
  type: 'immediate' | 'short_term' | 'long_term';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  targetStudents: string[];
  implementationSteps: string[];
  expectedOutcome: string;
  timeframe: string;
  resourcesNeeded: string[];
  successMetrics: string[];
}

export interface OptimizedClass {
  id: string;
  name: string;
  students: Array<{
    studentId: string;
    studentName: string;
    role: string;
    placementReason: string;
  }>;
  teacherId: string;
  teacherName: string;
  classroomId: string;
  balanceScore: number;
  strengths: string[];
  potentialChallenges: string[];
  recommendations: string[];
}

export interface ClassManagementData {
  classId: string;
  className: string;
  atmosphere: ClassAtmosphere;
  studentDynamics: StudentDynamic[];
  interventionSuggestions: Intervention[];
  optimizedComposition?: OptimizedClass;
  predictedConflicts: Array<{
    probability: number;
    type: string;
    participants: string[];
    preventionStrategies: string[];
  }>;
}

// ====== 智能家长沟通系统 ======

export interface CommunicationChannel {
  type: 'email' | 'sms' | 'app' | 'phone' | 'meeting';
  preference: number; // 1-5
  bestTime: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
}

export interface CommunicationRecord {
  id: string;
  timestamp: string;
  channel: string;
  direction: 'inbound' | 'outbound';
  subject: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  responseTime: number;
  resolved: boolean;
  followUpNeeded: boolean;
}

export interface PersonalizedContent {
  id: string;
  parentId: string;
  type: 'newsletter' | 'progress_report' | 'activity_suggestion' | 'milestone_celebration' | 'behavioral_update';
  title: string;
  content: string;
  relevanceScore: number;
  sendTime: string;
  personalizedElements: string[];
  parentPreferences: string[];
  childSpecificContent: boolean;
  engagementPrediction: number;
}

export interface AutoResponse {
  id: string;
  trigger: string;
  response: string;
  confidence: number;
  category: 'general' | 'academic' | 'behavioral' | 'administrative';
  requiresHumanReview: boolean;
  alternativeResponses: string[];
}

export interface CommunicationAnalysis {
  parentId: string;
  engagementScore: number;
  responseRate: number;
  averageResponseTime: number;
  preferredChannels: CommunicationChannel[];
  communicationPattern: {
    frequency: number;
    timing: string[];
    topics: Array<{
      topic: string;
      frequency: number;
      sentiment: number;
    }>;
  };
  satisfactionScore: number;
  improvementSuggestions: string[];
  riskFactors: string[];
}

export interface SmartCommunication {
  parentId: string;
  parentName: string;
  preferredChannels: CommunicationChannel[];
  communicationHistory: CommunicationRecord[];
  engagementScore: number;
  personalizedContent: PersonalizedContent[];
  autoResponses: AutoResponse[];
  analysis: CommunicationAnalysis;
  nextScheduledContact: string;
  pendingActions: string[];
}

// ====== 智能排课和资源分配 ======

export interface TeacherWorkload {
  teacherId: string;
  teacherName: string;
  currentHours: number;
  optimalHours: number;
  subjects: string[];
  classRooms: string[];
  specializations: string[];
  availability: Array<{
    day: string;
    timeSlots: string[];
    conflicts: string[];
  }>;
  workloadBalance: number;
  stressLevel: number;
}

export interface ResourceAllocation {
  resourceId: string;
  resourceType: 'classroom' | 'equipment' | 'material' | 'facility';
  resourceName: string;
  capacity: number;
  currentUtilization: number;
  optimalUtilization: number;
  availability: Array<{
    day: string;
    timeSlots: string[];
    bookedBy: string[];
  }>;
  maintenanceSchedule: string[];
  recommendations: string[];
}

export interface ScheduleOptimizationResult {
  optimizationId: string;
  generatedAt: string;
  improvements: Array<{
    type: 'workload_balance' | 'resource_efficiency' | 'conflict_resolution';
    description: string;
    impact: number;
    implementation: string[];
  }>;
  teacherWorkloads: TeacherWorkload[];
  resourceAllocations: ResourceAllocation[];
  conflictResolutions: Array<{
    conflictType: string;
    originalSchedule: string;
    optimizedSchedule: string;
    resolution: string;
  }>;
  overallEfficiency: number;
  implementationPlan: string[];
  approvalRequired: boolean;
}

// ====== 综合智能分析 ======

export interface BusinessIntelligenceData {
  studentAnalytics: {
    totalStudents: number;
    growthAnalyzed: number;
    averageGrowthScore: number;
    aiRecommendationsGenerated: number;
    milestonesPredicted: number;
    accuracyRate: number;
  };
  teacherAnalytics: {
    totalTeachers: number;
    performanceAnalyzed: number;
    averagePerformanceScore: number;
    optimizationsSuggested: number;
    developmentPlansGenerated: number;
    implementationRate: number;
  };
  classManagement: {
    totalClasses: number;
    atmosphereMonitored: number;
    conflictsPrevented: number;
    interventionsSuccessful: number;
    optimizationAccuracy: number;
  };
  parentCommunication: {
    totalParents: number;
    engagementImproved: number;
    personalizedContentGenerated: number;
    responseRateImproved: number;
    satisfactionScore: number;
  };
  systemEfficiency: {
    automationLevel: number;
    timesSaved: number;
    errorReduction: number;
    userSatisfaction: number;
    overallScore: number;
  };
}

// ====== 导出类型 ======
// 注意：ApiResponse等基础类型已在其他文件中定义，避免重复导出

// 类型已在上面定义并导出，无需重复导出