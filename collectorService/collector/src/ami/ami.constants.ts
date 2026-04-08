// src/ami/ami.constants.ts
export const AMI_ACTIONS = {
  SIP_SHOW_PEER: 'SIPshowpeer',
  PING: 'Ping',
  LOGIN: 'Login',
  LOGOFF: 'Logoff',
} as const;

export const AMI_EVENTS = {
  FULLY_BOOTED: 'FullyBooted',
  PEER_STATUS: 'PeerStatus',
} as const;