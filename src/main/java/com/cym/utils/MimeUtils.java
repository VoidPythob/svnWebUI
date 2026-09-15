package com.cym.utils;

public class MimeUtils {

     public static String getContentType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png"))  return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".gif"))  return "image/gif";
        if (lower.endsWith(".bmp"))  return "image/bmp";
        if (lower.endsWith(".webp")) return "image/webp";
        if (lower.endsWith(".svg"))  return "image/svg+xml";
        if (lower.endsWith(".pdf"))  return "application/pdf";
        if (lower.endsWith(".txt") || lower.endsWith(".log")
                || lower.endsWith(".java") || lower.endsWith(".js")
                || lower.endsWith(".css") || lower.endsWith(".html")
                || lower.endsWith(".xml") || lower.endsWith(".json")
                || lower.endsWith(".md") || lower.endsWith(".yml")
                || lower.endsWith(".yaml") || lower.endsWith(".properties")) {
            return "text/plain; charset=UTF-8";
        }
        if (lower.endsWith(".mp4"))  return "video/mp4";
        if (lower.endsWith(".mp3"))  return "audio/mpeg";
        return "application/octet-stream";
    }
}
