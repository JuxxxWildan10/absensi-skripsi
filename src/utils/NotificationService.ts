
export const NotificationService = {
    // In the future, this could integrate with a customized gateway
    formatMessage: (studentName: string, status: string, time: string) => {
        return `Halo, menginformasikan bahwa siswa atas nama *${studentName}* telah melakukan presensi pada jam *${time}* dengan status *${status}*. Terima kasih.`;
    },

    sendWhatsApp: async (phone: string, studentName: string, status: string, time: string) => {
        const message = NotificationService.formatMessage(studentName, status, time);
        console.log(`[WA MOCK] Sending to ${phone}: ${message}`);
        // In a real app, you would make an API call here
        return true;
    }
};
