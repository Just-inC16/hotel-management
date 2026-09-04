package com.tcs.notification.email;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmailDto {
    private String to;
    private String subject;
    private String body;
}
