import { 
  users, type User, type InsertUser,
  demoRequests, type DemoRequest, type InsertDemoRequest,
  aiConversations, type AiConversation, type InsertAiConversation
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Demo requests
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getDemoRequests(): Promise<DemoRequest[]>;
  getDemoRequest(id: number): Promise<DemoRequest | undefined>;
  
  // AI conversations
  createAiConversation(conversation: InsertAiConversation): Promise<AiConversation>;
  getAiConversations(userId?: number): Promise<AiConversation[]>;
  getAiConversation(id: number): Promise<AiConversation | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private demoRequests: Map<number, DemoRequest>;
  private aiConversations: Map<number, AiConversation>;
  private currentUserId: number;
  private currentDemoRequestId: number;
  private currentAiConversationId: number;

  constructor() {
    this.users = new Map();
    this.demoRequests = new Map();
    this.aiConversations = new Map();
    this.currentUserId = 1;
    this.currentDemoRequestId = 1;
    this.currentAiConversationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.currentDemoRequestId++;
    const demoRequest: DemoRequest = {
      ...insertDemoRequest,
      id,
      createdAt: new Date(),
      contacted: false
    };
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }

  async getDemoRequests(): Promise<DemoRequest[]> {
    return Array.from(this.demoRequests.values());
  }

  async getDemoRequest(id: number): Promise<DemoRequest | undefined> {
    return this.demoRequests.get(id);
  }

  async createAiConversation(insertAiConversation: InsertAiConversation): Promise<AiConversation> {
    const id = this.currentAiConversationId++;
    const aiConversation: AiConversation = {
      ...insertAiConversation,
      id,
      createdAt: new Date()
    };
    this.aiConversations.set(id, aiConversation);
    return aiConversation;
  }

  async getAiConversations(userId?: number): Promise<AiConversation[]> {
    const conversations = Array.from(this.aiConversations.values());
    if (userId) {
      return conversations.filter(conv => conv.userId === userId);
    }
    return conversations;
  }

  async getAiConversation(id: number): Promise<AiConversation | undefined> {
    return this.aiConversations.get(id);
  }
}

export const storage = new MemStorage();
