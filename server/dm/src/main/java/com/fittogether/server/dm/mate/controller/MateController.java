package com.fittogether.server.dm.mate.controller;

import com.fittogether.server.dm.domain.dto.RequestDto;
import com.fittogether.server.dm.domain.dto.RequestForm;
import com.fittogether.server.dm.service.MateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
public class MateController {
    private final MateService mateService;

    public MateController(MateService mateService) {
        this.mateService = mateService;
    }



    @PostMapping("/matching/request")
    public ResponseEntity<RequestDto> mateRequest(
            //@RequestHeader("token") String token
            @RequestBody RequestForm requestForm
    ){
          return ResponseEntity.ok(mateService.mateRequest(requestForm));
    }

    @PutMapping("/matching/{receiverId}")
    public ResponseEntity<Object> mateAccept(
            //@RequestHeader("token") String token
            @PathVariable Long receiverId,
            @RequestParam boolean is_matched
    ){
        mateService.mateAccept(receiverId,is_matched);

        Map<String, Object> responseData = new HashMap<>();
        responseData.put("status", "success");
        responseData.put("message", "메이트 수락 완료");

        return ResponseEntity.ok(responseData);
    }

}
