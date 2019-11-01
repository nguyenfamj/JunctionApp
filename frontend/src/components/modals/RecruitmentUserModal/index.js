import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import Modal from 'components/generic/Modal';
import Image from 'components/generic/Image';
import Button from 'components/generic/Button';

import { withSnackbar } from 'notistack';
import { Typography, Grid, Icon, Link, Box } from '@material-ui/core';

import GitHubIcon from '@material-ui/icons/GitHub';
import LinkedInIcon from '@material-ui/icons/LinkedIn';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import StarIcon from '@material-ui/icons/Star';

import styles from './RecruitmentUserModal.module.scss';
import LinkBall from './LinkBall';

import PageWrapper from 'components/layouts/PageWrapper';

import RecruitmentProfileInfo from './RecruitmentProfileInfo';

import CenteredContainer from 'components/generic/CenteredContainer';

import * as AuthSelectors from 'redux/auth/selectors';
import * as RecruitmentSelectors from 'redux/recruitment/selectors';

import UserProfilesService from 'services/userProfiles';

import * as RecruitmentActions from 'redux/recruitment/actions';

const RecruitmentUserModal = ({
  idToken,
  profileId,
  onClose,
  isFavorite,
  toggleFavorite
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [participant, setParticipant] = useState();

  useEffect(() => {
    if (profileId) {
      setLoading(true);

      UserProfilesService.getUserProfileRecruitment(profileId, idToken)
        .then(data => {
          setParticipant(data);
          console.log(data);
        })
        .catch(err => {
          setError(true);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [idToken, profileId]);

  const participantName = useMemo(() => {
    if (!participant) return '';
    const { firstName, lastName } = participant.profile;
    return `${firstName} ${lastName}`;
  }, [participant]);

  const participantSubheading = useMemo(() => {
    if (!participant) return '';
    return participant.profile.countryOfResidence;
  }, [participant]);

  const participantImageUrl = useMemo(() => {
    if (!participant) return '';
    return participant.profile.profilePicture;
  }, [participant]);

  const { social } = participant || {};

  const renderStar = () => {
    if (isFavorite) {
      return (
        <StarIcon
          fontSize="large"
          onClick={() => toggleFavorite(profileId, isFavorite)}
        />
      );
    }
    return (
      <StarBorderIcon
        fontSize="large"
        onClick={() => toggleFavorite(profileId, isFavorite)}
      />
    );
  };
  return (
    <Modal
      isOpen={!!profileId}
      handleClose={onClose}
      size="max"
      title="Profile details"
    >
      <PageWrapper
        loading={loading || !participant}
        error={error}
        render={() => (
          <CenteredContainer>
            <Box alignItems="center" justifyContent="center">
              <Grid
                container
                direction="column"
                alignItems="center"
                justifyContent="center"
              >
                <Grid item>{renderStar()}</Grid>
                <Grid item>
                  <Image
                    url={participantImageUrl}
                    alt="Profile picture"
                    className={styles.profilePic}
                  />
                </Grid>
                <Grid
                  item
                  alignItems="center"
                  justifyContent="center"
                  className={styles.nameContainer}
                >
                  <Typography variant="h3">{participantName}</Typography>
                  <Typography variant="h6">{participantSubheading}</Typography>
                </Grid>
                <Grid item>
                  {social && social.linkedin && (
                    <LinkBall target={social.linkedin}>
                      <LinkedInIcon />
                    </LinkBall>
                  )}
                  {social && social.github && (
                    <LinkBall target={social.github}>
                      <GitHubIcon />
                    </LinkBall>
                  )}
                </Grid>
              </Grid>
              <RecruitmentProfileInfo participant={participant} />
            </Box>
          </CenteredContainer>
        )}
      />
    </Modal>
  );
};

const mapState = (state, ownProps) => {
  const actionHistory = RecruitmentSelectors.actionHistory(state);
  const filteredActions = actionHistory.filter(
    action => action.user === ownProps.profileId
  );
  const isFavorite =
    actionHistory.filter(
      action => action.user === ownProps.profileId && action.type === 'favorite'
    ).length !== 0;

  return {
    idToken: AuthSelectors.getIdToken(state),
    actions: filteredActions,
    isFavorite
  };
};

const mapDispatch = dispatch => ({
  toggleFavorite: (profileId, isFavorite) =>
    dispatch(RecruitmentActions.toggleFavorite(profileId, isFavorite))
});

export default withSnackbar(
  connect(
    mapState,
    mapDispatch
  )(RecruitmentUserModal)
);
