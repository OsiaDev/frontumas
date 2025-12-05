import { apiService } from '@shared/services/api.service';

interface CommandResponse {
    success: boolean;
    message: string;
}

class MissionCommandsService {
    private readonly baseUrl = '/commands';

    async returnToHome(missionId: string): Promise<CommandResponse> {
        return apiService.post<CommandResponse>(`v1${this.baseUrl}/${missionId}/return-to-home`);
    }

    async land(missionId: string): Promise<CommandResponse> {
        return apiService.post<CommandResponse>(`v1${this.baseUrl}/${missionId}/land`);
    }
}

export const missionCommandsService = new MissionCommandsService();
