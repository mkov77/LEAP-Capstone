import React from 'react';
import { Image } from '@mantine/core';

import airAssaultBLUE from '../images/symbols/air_assault_BLUE.png';
import airAssaultRED from '../images/symbols/air_assault_RED.png';

import airDefenseBLUE from '../images/symbols/air_defense_BLUE.png';
import airDefenseRED from '../images/symbols/air_defense_RED.png';

import ammunitionBLUE from '../images/symbols/ammunition_BLUE.png';
import ammunitionRED from '../images/symbols/ammunition_RED.png';

import armoredBLUE from '../images/symbols/armored_mechanized_BLUE.png';
import armoredRED from '../images/symbols/armored_mehanized_RED.png';

import armoredTrackedBLUE from '../images/symbols/armored_mechanized_tracked_BLUE.png';
import armoredTrackedRED from '../images/symbols/armored_mechanized_tracked_RED.png';

import combatServiceBLUE from '../images/symbols/combat_service_support_BLUE.png';
import combatServiceRED from '../images/symbols/combat_service_support_RED.png';

import combatSupportBLUE from '../images/symbols/combat_support_BLUE.png';
import combatSupportRED from '../images/symbols/combat_support_RED.png';

import combinedArmsBLUE from '../images/symbols/combined_arms_BLUE.png';
import combinedArmsRED from '../images/symbols/combined_arms_RED.png';

import commandControlBLUE from '../images/symbols/command_and_control_BLUE.png';
import commandControlRED from '../images/symbols/command_and_control_RED.png';

import electronicWarfareBLUE from '../images/symbols/electronic_warfare_BLUE.png';
import electronicWarfareRED from '../images/symbols/electronic_warfare_RED.png';

import engineerBLUE from '../images/symbols/engineer_BLUE.png';
import engineerRED from '../images/symbols/engineer_RED.png';

import fieldArtilleryBLUE from '../images/symbols/field_artillery_BLUE.png';
import fieldArtilleryRED from '../images/symbols/field_artillery_RED.png';

import infantryBLUE from '../images/symbols/infantry_BLUE.png';
import infantryRED from '../images/symbols/infantry_RED.png';

import medicalBLUE from '../images/symbols/medical_treatment_facility_BLUE.png';
import medicalRED from '../images/symbols/medical_treatment_facility_RED.png';

import petroleumBLUE from '../images/symbols/petroleum_oil_lubricants_BLUE.png';
import petroleumRED from '../images/symbols/petroleum_oil_lubricants_RED.png';

import railheadBLUE from '../images/symbols/railhead_BLUE.png';
import railheadRED from '../images/symbols/railhead_RED.png';

import reconBLUE from '../images/symbols/recon_BLUE.png';
import reconRED from '../images/symbols/recon_RED.png';

import rotaryBLUE from '../images/symbols/rotary_wing_BLUE.png';
import rotaryRED from '../images/symbols/rotary_wing_RED.png';

import seaPortBLUE from '../images/symbols/sea_port_BLUE.png';
import seaPortRED from '../images/symbols/sea_port_RED.png';

import selfPropelledBLUE from '../images/symbols/self_propelled_BLUE.png';
import selfPropelledRED from '../images/symbols/self_propelled_RED.png';

import signalBLUE from '../images/symbols/signal_BLUE.png';
import signalRED from '../images/symbols/signal_RED.png';

import specialOperationsBLUE from '../images/symbols/special_operations_forces_BLUE.png';
import specialOperationsRED from '../images/symbols/special_operations_forces_RED.png';

import sustainmentBLUE from '../images/symbols/sustainment_BLUE.png';
import sustainmentRED from '../images/symbols/sustainment_RED.png';

import unmannedBLUE from '../images/symbols/unmanned_aerial_systems_BLUE.png';
import unmannedRED from '../images/symbols/unmanned_aerial_systems_RED.png';

interface UnitImage {
  blue: string;
  red: string;
}

function unitTypeToKey(unitType: string): keyof typeof unitImages | undefined {
    switch (unitType) {
      case 'Command and Control':
        return 'commandAndControl';
      case 'Infantry':
        return 'infantry';
      case 'Reconnaissance':
        return 'recon';
      case 'Armored Mechanized':
        return 'armoredMechanized';
      case 'Combined Arms':
        return 'combinedArms';
      case 'Armored Mechanized Tracked':
        return 'armoredMechanizedTracked';
      case 'Field Artillery':
        return 'fieldArtillery';
      case 'Self-propelled':
        return 'selfPropelled';
      case 'Electronic Warfare':
        return 'electronicWarfare';
      case 'Signal':
        return 'signal';
      case 'Special Operations Forces':
        return 'specialOperationsForces';
      case 'Ammunition':
        return 'ammunition';
      case 'Air Defense':
        return 'airDefense';
      case 'Engineer':
        return 'engineer';
      case 'Air Assault':
        return 'airAssault';
      case 'Medical Treatment Facility':
        return 'medicalTreatmentFacility';
      case 'Aviation Rotary Wing':
        return 'rotaryWing';
      case 'Combat Support':
        return 'combatSupport';
      case 'Sustainment':
        return 'sustainment';
      case 'Unmanned Aerial Systems':
        return 'unmannedAerialSystems';
      case 'Combat Service Support':
        return 'combatServiceSupport';
      case 'Petroleum, Oil and Lubricants':
        return 'petroleumOilLubricants';
      case 'Sea Port':
        return 'seaPort';
      case 'Railhead':
        return 'railhead';
      default:
        return undefined; // Handle cases where unitType does not match any key
    }
  }  

const unitImages: { [key: string]: UnitImage } = {
  airAssault: { blue: airAssaultBLUE, red: airAssaultRED },
  airDefense: { blue: airDefenseBLUE, red: airDefenseRED },
  ammunition: { blue: ammunitionBLUE, red: ammunitionRED },
  armoredMechanized: { blue: armoredBLUE, red: armoredRED },
  armoredMechanizedTracked: { blue: armoredTrackedBLUE, red: armoredTrackedRED },
  combatServiceSupport: { blue: combatServiceBLUE, red: combatServiceRED },
  combatSupport: { blue: combatSupportBLUE, red: combatSupportRED },
  combinedArms: { blue: combinedArmsBLUE, red: combinedArmsRED },
  commandAndControl: { blue: commandControlBLUE, red: commandControlRED },
  electronicWarfare: { blue: electronicWarfareBLUE, red: electronicWarfareRED },
  engineer: { blue: engineerBLUE, red: engineerRED },
  fieldArtillery: { blue: fieldArtilleryBLUE, red: fieldArtilleryRED },
  infantry: { blue: infantryBLUE, red: infantryRED },
  medicalTreatmentFacility: { blue: medicalBLUE, red: medicalRED },
  petroleumOilLubricants: { blue: petroleumBLUE, red: petroleumRED },
  railhead: { blue: railheadBLUE, red: railheadRED },
  recon: { blue: reconBLUE, red: reconRED },
  rotaryWing: { blue: rotaryBLUE, red: rotaryRED },
  seaPort: { blue: seaPortBLUE, red: seaPortRED },
  selfPropelled: { blue: selfPropelledBLUE, red: selfPropelledRED },
  signal: { blue: signalBLUE, red: signalRED },
  specialOperationsForces: { blue: specialOperationsBLUE, red: specialOperationsRED },
  sustainment: { blue: sustainmentBLUE, red: sustainmentRED },
  unmannedAerialSystems: { blue: unmannedBLUE, red: unmannedRED },
};

interface Props {
  unitType: keyof typeof unitImages;
  isFriendly: boolean;
}

const ImageLoader: React.FC<Props> = ({ unitType, isFriendly }) => {
    const unitKey = unitTypeToKey(unitType.toString());

    if (!unitKey) {
        console.warn(`No matching unit key found for unit type: ${unitType}`);
        return null; // or handle this case accordingly
      }

    const imageSrc = isFriendly ? unitImages[unitKey]?.blue || '' : unitImages[unitKey]?.red || '';

  return (
    <Image
      src={imageSrc}
      fit="contain"
      height={160}
      alt={`${unitType} image`}
      style={{ width: '100%', maxHeight: '100%', objectFit: 'contain' }}
    />
  );
};

export default ImageLoader;
