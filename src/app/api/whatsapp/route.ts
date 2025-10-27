import { NextRequest, NextResponse } from "next/server";
import { WhatsAppService } from "@/lib/whatsappService";

export async function POST(request: NextRequest) {
  try {
    const { phone, message, orderNumber, customerName, status } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    let whatsappSent = false;

    if (orderNumber && customerName && status) {
      // Send status update
      whatsappSent = await WhatsAppService.sendOrderStatusUpdate(
        orderNumber,
        customerName,
        status,
        phone
      );
    } else if (message) {
      // Send custom message
      const phoneNumber = WhatsAppService['formatPhoneNumber'](phone);
      if (phoneNumber) {
        console.log('Custom WhatsApp Message to send:');
        console.log('Phone:', phoneNumber);
        console.log('Message:', message);
        whatsappSent = true;
      }
    } else {
      return NextResponse.json(
        { success: false, message: "Either message or order details are required" },
        { status: 400 }
      );
    }

    if (whatsappSent) {
      return NextResponse.json({
        success: true,
        message: "WhatsApp message sent successfully",
        whatsappURL: WhatsAppService.generateWhatsAppWebURL(phone, message || "Order confirmation")
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to send WhatsApp message" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone');
  const message = searchParams.get('message') || 'Test message from Patram Store';

  if (!phone) {
    return NextResponse.json(
      { success: false, message: "Phone number is required" },
      { status: 400 }
    );
  }

  const whatsappURL = WhatsAppService.generateWhatsAppWebURL(phone, message);

  return NextResponse.json({
    success: true,
    whatsappURL,
    message: "WhatsApp URL generated successfully"
  });
}
