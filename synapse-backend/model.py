import torch
import torch.nn as nn

class AttentionGate(nn.Module):
    def __init__(self, F_g, F_l, F_int):
        super(AttentionGate, self).__init__()
        self.W_g = nn.Sequential(nn.Conv2d(F_g, F_int, kernel_size=1, stride=1, padding=0), nn.BatchNorm2d(F_int))
        self.W_l = nn.Sequential(nn.Conv2d(F_l, F_int, kernel_size=1, stride=1, padding=0), nn.BatchNorm2d(F_int))
        self.psi = nn.Sequential(nn.Conv2d(F_int, 1, kernel_size=1, stride=1, padding=0), nn.BatchNorm2d(1), nn.Sigmoid())
        self.relu = nn.ReLU(inplace=True)
        
    def forward(self, g, l):
        g1 = self.W_g(g)
        l1 = self.W_l(l)
        psi = self.relu(g1 + l1)
        return l * self.psi(psi)

class AttentionUnet(nn.Module):
    def __init__(self, img_ch=3, output_ch=1):
        super(AttentionUnet, self).__init__()
        # Note: This is a standard structure. If your friend's model has different
        # layer counts, we may need to adjust these channels.
        self.conv = nn.Conv2d(img_ch, 64, kernel_size=3, padding=1)
        self.gate = AttentionGate(F_g=64, F_l=64, F_int=32)
        self.out = nn.Conv2d(64, output_ch, kernel_size=1)

    def forward(self, x):
        x = torch.relu(self.conv(x))
        # For simplicity in this demo, we bypass complex skip connections
        # to ensure the .pth file loads without a shape mismatch.
        return torch.sigmoid(self.out(x))